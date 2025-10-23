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
    const [items, setItems] = useState([]); // [{ question, answers }]
    const [selected, setSelected] = useState([]); // per-question selected index Array(number|null)

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

        fetchOpenTdbRaw({ amount, difficulty, category, signal: ctrl.signal })
            .then(json => {
                const results = json.results;

                // precompute shuffled answers exactly once per fetch
                const processed = results.map(q => ({
                    question: q.question,
                    answers: shuffle([
                        q.correct_answer,
                        ...q.incorrect_answers,
                    ]),
                }));

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

    if (status === 'loading') return <p>Loading…</p>;
    if (status === 'error')
        return <p style={{ color: 'salmon' }}>Error: {error}</p>;

    return (
        <section>
            <h2>Questions (select an answer)</h2>

            {items.length > 0 ? (
                <ol style={{ lineHeight: 1.6, paddingLeft: 18 }}>
                    {items.map((it, qIndex) => (
                        <li key={qIndex} style={{ marginBottom: 16 }}>
                            {/* NOTE: still raw HTML entities for now */}
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                {it.question}
                            </div>

                            <ul
                                role="radiogroup"
                                style={{ listStyle: 'none', paddingLeft: 0 }}
                            >
                                {it.answers.map((a, aIndex) => {
                                    const isSelected =
                                        selected[qIndex] === aIndex;
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
                                                    name={`q-${qIndex}`}
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        onSelect(qIndex, aIndex)
                                                    }
                                                />
                                                <span>{a}</span>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    ))}
                </ol>
            ) : (
                <p style={{ opacity: 0.8 }}>No questions to display.</p>
            )}
        </section>
    );
}
