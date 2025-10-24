import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

    // store processed items (with answers already shuffled)
    //  include correctIndex so we can score
    const [items, setItems] = useState([]); // [{ question, answers, correctIndex }]
    const [selected, setSelected] = useState([]); // per-question selected index Array(number|null)

    const [current, setCurrent] = useState(0); // index of the current question

    const [score, setScore] = useState(0); // running score

    const amount = Number(params.get('amount') ?? 10);
    const difficulty = params.get('difficulty') ?? '';
    const category = params.get('category') ?? '';

    useEffect(() => {
        const ctrl = new AbortController();
        // resets on param change
        setStatus('loading');
        setError(null);
        setItems([]);
        setSelected([]);
        setCurrent(0); // reset to first question when fetching
        setScore(0); // reset score on new fetch

        fetchOpenTdbRaw({ amount, difficulty, category, signal: ctrl.signal })
            .then(json => {
                const results = Array.isArray(json?.results)
                    ? json.results
                    : [];

                // early-exit for empty results (e.g., API returned none)
                if (results.length === 0) {
                    setStatus('ready'); // we're "done" but have nothing to show
                    return; // IMPORTANT: stop here
                }

                // compute shuffled answers + correctIndex exactly once
                const processed = results.map(q => {
                    const answers = shuffle([
                        q.correct_answer,
                        ...q.incorrect_answers,
                    ]);
                    const correctIndex = answers.findIndex(
                        a => a === q.correct_answer
                    );
                    return {
                        question: q.question,
                        answers,
                        correctIndex,
                    };
                });

                setItems(processed);
                setSelected(
                    Array.from({ length: processed.length }, () => null)
                ); // init selection slots
                setStatus('ready');
            })
            .catch(err => {
                if (err?.name === 'AbortError') return;
                setError(err?.message || 'Failed to load');
                setStatus('error');
            });

        return () => ctrl.abort();
    }, [amount, difficulty, category]);

    const onSelect = (qIndex, aIndex) => {
        setSelected(prev => {
            const next = prev.slice();
            next[qIndex] = aIndex;
            return next;
        });
    };

    // derived flags for Next button
    const hasItems = items.length > 0;
    const isLast = hasItems && current === items.length - 1;
    const canProceed = hasItems && selected[current] !== null;

    const handleNext = () => {
        if (!canProceed) return;

        // score this question before moving on
        const chosen = selected[current];
        const correct = items[current].correctIndex;
        if (chosen === correct) {
            setScore(s => s + 1);
        }

        if (isLast) return; // we’ll handle final scoring/finish later

        setCurrent(c => c + 1); // go to next question
    };

    if (status === 'loading') return <p>Loading…</p>;
    if (status === 'error')
        return <p style={{ color: 'salmon' }}>Error: {error}</p>;

    return (
        <section>
            <h2>Questions (select an answer)</h2>

            {/* show running score */}
            <div style={{ opacity: 0.9, marginBottom: 8 }}>Score: {score}</div>

            {items.length > 0 ? (
                <>
                    {/* simple progress status*/}
                    <div style={{ opacity: 0.8, marginBottom: 8 }}>
                        Question {current + 1} of {items.length}
                    </div>

                    {/* render only the current question */}
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
                                                name={`q-${current}`} // name by current index
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

                    {/* Next button (disabled until selection) */}
                    <div>
                        <button
                            onClick={handleNext}
                            disabled={!canProceed || isLast}
                            title={
                                isLast
                                    ? 'This is the last question (finish comes later)'
                                    : !canProceed
                                      ? 'Select an answer first'
                                      : 'Score this question and go next'
                            }
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <p style={{ opacity: 0.8 }}>No questions to display.</p>
            )}
        </section>
    );
}
