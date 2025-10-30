import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizCtx } from '../context/QuizContext';
import { fetchCategories } from '../services/opentdb';

export default function Home() {
    const { settings, setSettings } = useQuizCtx(); // read/write persisted settings
    // local draft to avoid unnecessary localStorage writes with each change of value in the form
    const [draftSettings, setDraftSettings] = useState(settings);

    const [categories, setCategories] = useState([]); // [{ id, name }]

    const [catStatus, setCatStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
    const [catError, setCatError] = useState(null);
    const navigate = useNavigate();

    // load categories (uses TTL cache + centralized 5s cooldown in the service)
    useEffect(() => {
        const ctrl = new AbortController();
        setCatStatus('loading');
        setCatError(null);

        fetchCategories({ signal: ctrl.signal })
            .then(list => {
                setCategories(list);
                setCatStatus('ready');
            })
            .catch(err => {
                if (err?.name === 'AbortError') return;
                setCatError(err?.message || 'Failed to load categories');
                setCatStatus('error');
            });

        return () => ctrl.abort();
    }, []);

    // if a persisted category no longer exists, clear it when categories are ready
    useEffect(() => {
        if (catStatus !== 'ready') return;
        const exists = categories.some(
            c => String(c.id) === String(draftSettings.category)
        );
        if (!exists) {
            setDraftSettings(prev => ({ ...prev, category: '' })); // fallback to "Any"
        }
    }, [catStatus, categories, draftSettings.category]);

    const onStart = e => {
        e.preventDefault();
        // persist the draft settings only when starting
        setSettings(draftSettings);
        navigate('/play');
    };

    return (
        <section style={{ padding: '16px' }}>
            <h1 style={{ marginBottom: 12 }}>Quiz</h1>
            <form
                onSubmit={onStart}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    maxWidth: 420,
                }}
            >
                <label>
                    {/* wraps text & input: automatic association, no need for id/htmlFor */}
                    Questions:{' '}
                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={draftSettings.amount}
                        onChange={e =>
                            setDraftSettings(prev => ({
                                ...prev,
                                amount: Number(e.target.value),
                            }))
                        }
                    />
                </label>

                <label>
                    Difficulty:{' '}
                    <select
                        value={draftSettings.difficulty}
                        onChange={e =>
                            setDraftSettings(prev => ({
                                ...prev,
                                difficulty: e.target.value,
                            }))
                        }
                    >
                        <option value="">Any</option>
                        <option value="easy">easy</option>
                        <option value="medium">medium</option>
                        <option value="hard">hard</option>
                    </select>
                </label>

                {/* real Category dropdown sourced from OpenTDB */}
                <label>
                    Category:{' '}
                    <select
                        value={draftSettings.category}
                        onChange={e =>
                            setDraftSettings(prev => ({
                                ...prev,
                                // store the id as string; empty string means "Any"
                                category: e.target.value,
                            }))
                        }
                        disabled={
                            catStatus === 'loading' || catStatus === 'error'
                        }
                        aria-busy={catStatus === 'loading'}
                        style={{ minWidth: 260 }}
                    >
                        <option value="">
                            {catStatus === 'loading'
                                ? 'Loading…'
                                : 'Any category'}
                        </option>
                        {catStatus === 'ready' &&
                            categories.map(c => (
                                <option key={c.id} value={String(c.id)}>
                                    {c.name}
                                </option>
                            ))}
                    </select>
                    {catStatus === 'error' && (
                        <div style={{ color: 'salmon', paddingTop: 6 }}>
                            {catError} — using “Any category”.
                        </div>
                    )}
                </label>

                <div style={{ marginTop: 12 }}>
                    <button
                        type="submit"
                        // only block if a specific category is persisted AND categories are still loading:
                        // that prevents an obsolete category to be selected (pretty rare edge case)
                        disabled={
                            catStatus === 'loading' &&
                            draftSettings.category !== ''
                        }
                    >
                        Start Quiz
                    </button>
                </div>
            </form>
        </section>
    );
}
