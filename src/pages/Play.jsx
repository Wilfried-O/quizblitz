import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchOpenTdbRaw } from '../services/opentdb';

// Fisher–Yates algo for shuffle helper
function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function Play() {
    const [params] = useSearchParams();
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    // [{ question, answers, correctIndex }]
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState([]); // number|null per question
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);

    const [finished, setFinished] = useState(false);

    const [reloadSeed, setReloadSeed] = useState(0); // (used by "Play again")

    const amount = Number(params.get('amount') ?? 10);
    const difficulty = params.get('difficulty') ?? '';
    const category = params.get('category') ?? '';

    useEffect(() => {
        const ctrl = new AbortController();
        setStatus('loading');
        setError(null);
        setItems([]);
        setSelected([]);
        setCurrent(0);
        setScore(0);
        setFinished(false);

        fetchOpenTdbRaw({ amount, difficulty, category, signal: ctrl.signal })
            .then(json => {
                const results = Array.isArray(json?.results)
                    ? json.results
                    : [];

                // zero questions (e.g., bad params or API returned none)
                if (results.length === 0) {
                    setStatus('ready');
                    return; // IMPORTANT: stop here
                }

                const processed = results.map(q => {
                    const answers = shuffle([
                        q.correct_answer,
                        ...q.incorrect_answers,
                    ]);
                    const correctIndex = answers.findIndex(
                        a => a === q.correct_answer
                    );
                    return { question: q.question, answers, correctIndex };
                });
                setItems(processed);
                setSelected(
                    Array.from({ length: processed.length }, () => null)
                );
                setStatus('ready');
            })
            .catch(err => {
                if (err?.name === 'AbortError') return;
                setError(err?.message || 'Failed to load');
                setStatus('error');
            });

        return () => ctrl.abort();
    }, [amount, difficulty, category, reloadSeed]);

    const onSelect = (qIndex, aIndex) => {
        setSelected(prev => {
            const next = prev.slice();
            next[qIndex] = aIndex;
            return next;
        });
    };

    const hasItems = items.length > 0;
    const isLast = hasItems && current === items.length - 1;
    const canProceed = hasItems && selected[current] !== null;

    const handleNext = () => {
        if (!canProceed) return;

        // score current question before moving on
        const chosen = selected[current];
        const correct = items[current].correctIndex;
        if (chosen === correct) setScore(s => s + 1);

        if (isLast) return; // last question handled by Finish
        setCurrent(c => c + 1);
    };

    const handleFinish = () => {
        if (!canProceed) return; // require a selection on the last question

        // score the last question
        const chosen = selected[current];
        const correct = items[current].correctIndex;
        if (chosen === correct) setScore(s => s + 1);

        setFinished(true); // show summary
    };

    const handlePlayAgain = () => {
        setReloadSeed(s => s + 1);
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
                <h2>No questions available</h2>
                <p style={{ opacity: 0.85 }}>
                    Try different settings (amount, difficulty, or category).
                </p>
                <div style={{ marginTop: 12 }}>
                    <Link to="/">Home</Link>
                </div>
            </section>
        );
    }

    // Summary
    if (finished) {
        return (
            <section>
                <h2>Summary</h2>
                <p>
                    Score: <strong>{score}</strong> /{' '}
                    <strong>{items.length}</strong>
                </p>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={handlePlayAgain}>Play again</button>
                    <Link to="/" style={{ alignSelf: 'center' }}>
                        Home
                    </Link>
                </div>
            </section>
        );
    }

    // Main quiz view
    return (
        <section>
            <h2>Questions (select an answer)</h2>

            <div style={{ opacity: 0.9, marginBottom: 8 }}>Score: {score}</div>

            {items.length > 0 ? (
                <>
                    <div style={{ opacity: 0.8, marginBottom: 8 }}>
                        Question {current + 1} of {items.length}
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        {/* NOTE: still raw HTML entities for now */}
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                            {items[current].question}
                        </div>

                        <ul
                            role="radiogroup"
                            style={{ listStyle: 'none', paddingLeft: 0 }}
                        >
                            {items[current].answers.map((a, aIndex) => {
                                const isSelected = selected[current] === aIndex;
                                return (
                                    <li
                                        key={aIndex}
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
                                                    onSelect(current, aIndex)
                                                }
                                            />
                                            <span>{a}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div>
                        {!isLast ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed}
                                title={
                                    !canProceed
                                        ? 'Select an answer first'
                                        : 'Score and go next'
                                }
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                disabled={!canProceed}
                                title={
                                    !canProceed
                                        ? 'Select an answer first'
                                        : 'Finish and show summary'
                                }
                            >
                                Finish
                            </button>
                        )}
                    </div>
                </>
            ) : (
                // This branch is unlikely now, but kept as a fallback
                <p style={{ opacity: 0.8 }}>No questions to display.</p>
            )}
        </section>
    );
}
