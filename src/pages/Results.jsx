// Results.jsx
import { Link, Navigate } from 'react-router-dom';
import { useQuizCtx } from '../context/QuizContext';

export default function Results() {
    const { result } = useQuizCtx();

    // if no finished result, send to Home
    if (!result) return <Navigate to="/" replace />;

    const { score, total } = result;

    return (
        <section>
            <h2>Results</h2>
            <p>
                Score: <strong>{score}</strong> / <strong>{total}</strong>
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Link to="/play">
                    <button>Play again</button>
                </Link>
                <Link to="/" style={{ alignSelf: 'center' }}>
                    Home
                </Link>
            </div>
        </section>
    );
}
