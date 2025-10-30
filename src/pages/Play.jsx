import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchOpenTdbRaw } from '../services/opentdb';
import { useQuizCtx } from '../context/QuizContext';

// shuffle helper using Fisher–Yates algo
function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// formatter for timer
function formatMs(ms) {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const s = String(sec % 60).padStart(2, '0');
    return `${s}s`;
}

// simple DOM-based HTML entity decoder
// NOTE: safe from XSS attacks because we don't attach the element to the DOM
const decodeHtml = (() => {
    let el;
    return str => {
        if (typeof str !== 'string') return str;
        if (!el) {
            el = document.createElement('textarea');
        }
        el.innerHTML = str;
        return el.value;
    };
})();

export default function Play() {
    const navigate = useNavigate();
    const { settings, setResult, setIsPlaying } = useQuizCtx();
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
    const [error, setError] = useState(null);

    // items: [{ question, answers: [{ id, label }], correctId }]
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState([]); // string|null per question

    const [current, setCurrent] = useState(0); // track current question [0...items.length-1]
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const amount = Number(settings.amount ?? 10);
    const difficulty = settings.difficulty ?? '';
    const category = settings.category ?? '';

    // --- TIMER (per question) ---
    const PER_Q_MS = 20_000;
    const [remainingMs, setRemainingMs] = useState(PER_Q_MS);
    const endAtRef = useRef(null); // for deadline

    // Fetch & initialize quiz
    useEffect(() => {
        const ctrl = new AbortController();
        setStatus('loading');
        setError(null);

        setResult(null); // starting fresh run → remove previous result
        setIsPlaying(true); //  mark active run

        // reset quiz state
        setItems([]);
        setSelectedId([]);
        setCurrent(0);
        setScore(0);
        setFinished(false);

        // reset timer UI and clear deadline
        setRemainingMs(PER_Q_MS);
        endAtRef.current = null;

        fetchOpenTdbRaw({ amount, difficulty, category, signal: ctrl.signal })
            .then(json => {
                const results = Array.isArray(json?.results)
                    ? json.results
                    : [];

                // zero questions (e.g., bad params or API returned none)
                if (!results.length) {
                    setStatus('ready'); // we're "done" but have nothing to show
                    setIsPlaying(false);
                    return;
                }

                // build answers with stable ids, shuffle for display
                const processed = results.map((q, qIdx) => {
                    // decode question & all answer labels before we store them
                    const questionText = decodeHtml(q.question);
                    const correctLabel = decodeHtml(q.correct_answer);
                    const incorrectLabels = q.incorrect_answers.map(decodeHtml);

                    const options = [
                        {
                            id: `q${qIdx}-c`,
                            label: correctLabel,
                            isCorrect: true,
                        },
                        ...incorrectLabels.map((ans, i) => ({
                            id: `q${qIdx}-i${i}`,
                            label: ans,
                            isCorrect: false,
                        })),
                    ];
                    const shuffled = shuffle(options);
                    const correctId = shuffled.find(o => o.isCorrect)?.id;
                    return {
                        question: questionText,
                        answers: shuffled.map(({ id, label }) => ({
                            id,
                            label,
                        })),
                        correctId,
                    };
                });
                setItems(processed);

                // init selection slots
                setSelectedId(
                    Array.from({ length: processed.length }, () => null)
                );

                setStatus('ready');
            })
            .catch(err => {
                if (err?.name === 'AbortError') return;
                setError(err?.message || 'Failed to load');
                setStatus('error');
                setIsPlaying(false); // error aborts the run
            });

        return () => {
            ctrl.abort();
            setIsPlaying(false); // leaving /play ends the active run
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount, difficulty, category]);

    // Start (or restart) the timer whenever the active question changes
    useEffect(() => {
        if (!items.length || finished) return;
        const now = Date.now();
        endAtRef.current = now + PER_Q_MS;
        setRemainingMs(PER_Q_MS);
    }, [current, items.length, finished]);

    // The ticking loop (drift-free), reading the deadline from the ref
    useEffect(() => {
        if (!endAtRef.current || finished || !items.length) return;

        let timeoutId;

        const tick = () => {
            const now = Date.now();
            const deadline = endAtRef.current;
            if (!deadline) return;

            const remain = Math.max(0, deadline - now);
            setRemainingMs(remain);

            if (remain === 0) {
                autoAdvanceOnTimeout();
                return; // next question effect will restart the timer
            }

            const nextDelay = 1000 - (now % 1000);
            timeoutId = setTimeout(tick, nextDelay);
        };

        timeoutId = setTimeout(tick, 0);
        return () => timeoutId && clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, finished, items.length, selectedId]);

    // When a question times out: score if selected,
    const autoAdvanceOnTimeout = () => {
        if (finished || !items.length) return;

        const chosenId = selectedId[current];
        const correctId = items[current]?.correctId;

        let nextScore = score; // capture the value we'll persist
        if (chosenId && chosenId === correctId) {
            nextScore = score + 1;
            setScore(s => s + 1); // used for updating UI
        }

        const isLast = current === items.length - 1;
        if (isLast) {
            setFinished(true);
            endAtRef.current = null;

            // build the review payload (zip items with selections)
            const review = items.map((it, idx) => ({
                question: it.question,
                answers: it.answers, // [{ id, label }]
                correctId: it.correctId, // string
                selectedId: selectedId[idx], // string | null
            }));

            // include review in the result so Results page can render summary
            setResult({ score: nextScore, total: items.length, review });

            setIsPlaying(false);
            navigate('/results');
        } else {
            setCurrent(c => c + 1);
        }
    };

    const onSelect = (qIndex, answerId) => {
        if (finished) return;
        setSelectedId(prev => {
            const next = prev.slice();
            next[qIndex] = answerId;
            return next;
        });
    };

    if (status === 'loading') return <p>Loading…</p>;

    if (status === 'error') {
        return (
            <section>
                <p style={{ color: 'salmon' }}>Error: {error}</p>
                <div style={{ marginTop: 12 }}>
                    <Link to="/">Home</Link>
                </div>
            </section>
        );
    }

    // ready but no questions -> show "Go Home"
    if (status === 'ready' && items.length === 0 && !finished) {
        return (
            <section>
                <h2>Sorry, no questions available</h2>
                <p style={{ opacity: 0.85 }}>
                    Please, try different settings (amount, difficulty, or
                    category).
                </p>
                <div style={{ marginTop: 12 }}>
                    <Link to="/">Home</Link>
                </div>
            </section>
        );
    }

    // Main quiz view
    return (
        <section style={{ padding: '16px' }}>
            <h2>
                Question {current + 1} of {items.length}
            </h2>

            {/* Timer */}
            <div
                style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    padding: '18px 0 28px',
                }}
            >
                <div style={{ opacity: 0.8 }}>Score: {score}</div>
                <div>
                    Time left:{' '}
                    <strong style={{ color: 'orange', fontSize: '1.2em' }}>
                        {formatMs(remainingMs)}
                    </strong>
                </div>
            </div>

            {/* Current Question */}
            {items.length > 0 ? (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                            {items[current].question}
                        </div>
                        <div style={{ opacity: 0.7, marginBottom: 8 }}>
                            (select an answer)
                        </div>

                        <ul
                            role="radiogroup"
                            style={{ listStyle: 'none', paddingLeft: 0 }}
                        >
                            {items[current].answers.map(a => {
                                const isSelected = selectedId[current] === a.id;
                                return (
                                    <li
                                        key={a.id}
                                        style={{
                                            margin: '6px 0',
                                            padding: '6px 8px',
                                            borderRadius: 6,
                                            background: isSelected
                                                ? 'lightgrey'
                                                : 'transparent',
                                            outline: isSelected
                                                ? '1px solid #39408a'
                                                : '1px solid transparent',
                                        }}
                                    >
                                        <label
                                            style={{
                                                display: 'inline-flex',
                                                gap: 8,
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${current}`}
                                                checked={isSelected}
                                                onChange={() =>
                                                    onSelect(current, a.id)
                                                }
                                            />
                                            <span>{a.label}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </>
            ) : (
                // This branch is unlikely now, but kept as a fallback
                <p style={{ opacity: 0.8 }}>Sorry, no questions to display.</p>
            )}
        </section>
    );
}
