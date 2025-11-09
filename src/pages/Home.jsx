import Button from '../components/ui/Button';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizCtx } from '../context/QuizContext';
import { fetchCategories } from '../services/opentdb';

export default function Home() {
    const { settings, setSettings } = useQuizCtx();
    const [draftSettings, setDraftSettings] = useState(settings);

    const [categories, setCategories] = useState([]); // [{ id, name }]
    const [catStatus, setCatStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
    const [catError, setCatError] = useState(null);
    const navigate = useNavigate();

    // Page title
    useEffect(() => {
        document.title = 'QuizBlitz - Settings';
    }, []);

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
        setSettings(draftSettings); // persist only when starting
        navigate('/play');
    };

    return (
        <section className="home-page">
            {/* NOTE: The brand header is global; this is the page title for semantics */}
            <h1 className="page-title">Quiz settings</h1>

            {/* SETTINGS FORM */}
            <form className="settings-form" onSubmit={onStart}>
                <label className="field">
                    <span className="field-label">Questions</span>
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

                <label className="field">
                    <span className="field-label">Difficulty</span>
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
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </label>

                {/* Category from OpenTDB */}
                <label className="field">
                    <span className="field-label">Category</span>
                    <select
                        value={draftSettings.category}
                        onChange={e =>
                            setDraftSettings(prev => ({
                                ...prev,
                                category: e.target.value, // empty string means "Any"
                            }))
                        }
                        disabled={
                            catStatus === 'loading' || catStatus === 'error'
                        }
                        aria-busy={catStatus === 'loading'}
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
                        <div className="field-hint error">
                            {catError} — using &quot;Any category&quot;.
                        </div>
                    )}
                </label>

                <div className="actions">
                    <Button
                        variant="primary"
                        className=" btn-lg with-transition"
                        type="submit"
                        disabled={
                            catStatus === 'loading' &&
                            draftSettings.category !== ''
                        }
                    >
                        Start
                    </Button>
                </div>
            </form>
        </section>
    );
}
