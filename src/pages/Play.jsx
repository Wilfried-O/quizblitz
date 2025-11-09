import Pill from '../components/ui/Pill';
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
const decodeHtml = (() => {
    let el;
    return str => {
        if (typeof str !== 'string') return str;
        if (!el) el = document.createElement('textarea');
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

    const [current, setCurrent] = useState(0); // track current question
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const amount = Number(settings.amount ?? 10);
    const difficulty = settings.difficulty ?? '';
    const category = settings.category ?? '';

    // --- TIMER (per question) ---
    const PER_Q_MS = 20_000;
    const [remainingMs, setRemainingMs] = useState(PER_Q_MS);
    const endAtRef = useRef(null); // for deadline

    // Page title
    useEffect(() => {
        document.title = 'QuizBlitz - Play';
    }, []);
    useEffect(() => {
        if (items.length) {
            document.title = `QuizBlitz - Question ${current + 1} of ${items.length}`;
        }
    }, [current, items.length]);

    // Fetch & initialize quiz
    useEffect(() => {
        const ctrl = new AbortController();
        setStatus('loading');
        setError(null);

        setResult(null); // starting fresh run -> remove previous result
        setIsPlaying(true); // mark active run

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

                // zero questions
                if (!results.length) {
                    setStatus('ready');
                    setIsPlaying(false);
                    return;
                }

                const processed = results.map((q, qIdx) => {
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
                setSelectedId(
                    Array.from({ length: processed.length }, () => null)
                );
                setStatus('ready');
            })
            .catch(err => {
                if (err?.name === 'AbortError') return;
                setError(err?.message || 'Failed to load');
                setStatus('error');
                setIsPlaying(false);
            });

        return () => {
            ctrl.abort();
            setIsPlaying(false);
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

    // The ticking loop (drift-free)
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
                return;
            }
            const nextDelay = 1000 - (now % 1000);
            timeoutId = setTimeout(tick, nextDelay);
        };

        timeoutId = setTimeout(tick, 0);
        return () => timeoutId && clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, finished, items.length, selectedId]);

    const autoAdvanceOnTimeout = () => {
        if (finished || !items.length) return;

        const chosenId = selectedId[current];
        const correctId = items[current]?.correctId;

        let nextScore = score;
        if (chosenId && chosenId === correctId) {
            nextScore = score + 1;
            setScore(s => s + 1);
        }

        const isLast = current === items.length - 1;
        if (isLast) {
            setFinished(true);
            endAtRef.current = null;

            const review = items.map((it, idx) => ({
                question: it.question,
                answers: it.answers,
                correctId: it.correctId,
                selectedId: selectedId[idx],
            }));

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

    if (status === 'loading') return <p className="page-loading">Loading…</p>;

    if (status === 'error') {
        return (
            <section className="play-page">
                <p className="error-text">Error: {error}</p>
                <div className="back-link">
                    <Link to="/">Home</Link>
                </div>
            </section>
        );
    }

    if (status === 'ready' && items.length === 0 && !finished) {
        return (
            <section className="play-page">
                <h2 className="page-subtitle">Sorry, no questions available</h2>
                <p className="muted">
                    Please, try different settings (amount, difficulty, or
                    category).
                </p>
                <div className="back-link">
                    <Link to="/">Home</Link>
                </div>
            </section>
        );
    }

    return (
        <section className="play-page">
            <div className="play-header">
                <h1 className="page-title">
                    Question {current + 1} of {items.length}
                </h1>

                <div className="quiz-meta">
                    <Pill
                        label="Score"
                        value={`${score} / ${items.length || 0}`}
                    />
                    <div className="time">
                        Time left{' '}
                        <strong className="time-value">
                            {formatMs(remainingMs)}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Current Question */}
            {items.length > 0 ? (
                <div className="question-block">
                    <fieldset
                        role="radiogroup"
                        className="qz-fieldset"
                        aria-labelledby={`q-${current}-legend`}
                    >
                        <legend
                            id={`q-${current}-legend`}
                            className="question-text"
                        >
                            {items[current].question}
                        </legend>

                        <ul className="answers">
                            {items[current].answers.map(a => {
                                const isSelected = selectedId[current] === a.id;
                                return (
                                    <li
                                        key={a.id}
                                        className={`answer ${isSelected ? 'selected' : ''}`}
                                    >
                                        <label className="answer-label with-transition">
                                            <input
                                                className="answer-input"
                                                type="radio"
                                                name={`q-${current}`}
                                                checked={isSelected}
                                                onChange={() =>
                                                    onSelect(current, a.id)
                                                }
                                            />
                                            <span className="answer-text">
                                                {a.label}
                                            </span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </fieldset>
                </div>
            ) : (
                <p className="muted">Sorry, no questions to display.</p>
            )}
        </section>
    );
}
