import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizCtx } from '../context/QuizContext';

export default function Home() {
    const { settings, setSettings } = useQuizCtx(); // read/write persisted settings
    // local draft to avoid unnecessary localStorage writes with each change of value in the form
    const [draftSettings, setDraftSettings] = useState(settings);
    const navigate = useNavigate();

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

                <label>
                    Category:{' '}
                    <input
                        placeholder="(optional numeric id)"
                        value={draftSettings.category}
                        onChange={e =>
                            setDraftSettings(prev => ({
                                ...prev,
                                category: e.target.value,
                            }))
                        }
                    />
                    {/* keep it simple — we’ll wire a real category list later */}
                </label>

                <div style={{ marginTop: 12 }}>
                    <button type="submit">Start Quiz</button>
                </div>
            </form>
        </section>
    );
}
