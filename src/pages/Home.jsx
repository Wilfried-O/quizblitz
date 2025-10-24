import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [amount, setAmount] = useState(5);
    const [difficulty, setDifficulty] = useState('');
    const [category, setCategory] = useState('');
    const navigate = useNavigate();

    const onStart = e => {
        e.preventDefault(); // prevent page reload
        const qs = new URLSearchParams();
        qs.set('amount', String(amount));
        if (difficulty) qs.set('difficulty', difficulty);
        if (category) qs.set('category', category);
        navigate(`/play?${qs.toString()}`);
    };

    return (
        <section>
            <h1>Quiz</h1>
            <form onSubmit={onStart}>
                <label>
                    {/* wraps text & input: automatic association, no need for id/htmlFor */}
                    Questions
                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                    />
                </label>

                <label style={{ display: 'block', marginTop: 8 }}>
                    Difficulty
                    <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                    >
                        <option value="">Any</option>
                        <option value="easy">easy</option>
                        <option value="medium">medium</option>
                        <option value="hard">hard</option>
                    </select>
                </label>

                <label style={{ display: 'block', marginTop: 8 }}>
                    Category
                    <input
                        placeholder="(optional numeric id)"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    />
                    {/* keep it simple — we’ll wire a real category list later */}
                </label>

                <div style={{ marginTop: 12 }}>
                    <button type="submit">Start (see raw JSON)</button>
                </div>
            </form>
        </section>
    );
}
