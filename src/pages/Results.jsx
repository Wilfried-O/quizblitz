// Results.jsx
// CHANGED: keep only "Score" in the header meta; removed other stats/summary.
// CHANGED: no useMemo (fixes ESLint complaint about conditional hooks).
// CHANGED: preserved scrollable review area + pinned actions layout.

import { Link, Navigate } from 'react-router-dom';
import { useQuizCtx } from '../context/QuizContext';

export default function Results() {
    const { result } = useQuizCtx();

    // Guard: if no result, bounce to Home (this is before any other hooks).
    if (!result) return <Navigate to="/" replace />;

    const { score, total, review } = result;

    return (
        <section className="results-page">
            {/* Card is flex column; scroll happens inside .results-scroll */}
            <div className="results-card results-flex">
                {/* === Header row (title left, only Score on the right) === */}
                <div className="results-header">
                    <h1 className="page-title">Results</h1>

                    <div className="results-meta">
                        <div className="rmeta-item">
                            <span className="rmeta-label">Score</span>
                            <strong className="rmeta-value">
                                {score} / {total}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* === Scrollable review panel === */}
                <div className="results-scroll">
                    {/* Sticky subheader inside the scroll area */}
                    <div className="results-scroll-header">Review</div>

                    <ol className="review-list">
                        {review.map((item, idx) => {
                            const correct = item.answers.find(
                                a => a.id === item.correctId
                            )?.label;
                            const chosen = item.selectedId
                                ? item.answers.find(
                                      a => a.id === item.selectedId
                                  )?.label
                                : null;
                            const isCorrect =
                                chosen != null &&
                                item.selectedId === item.correctId;

                            return (
                                <li key={idx} className="review-item">
                                    <div className="review-row">
                                        <div
                                            aria-label={
                                                isCorrect
                                                    ? 'Correct'
                                                    : chosen
                                                      ? 'Incorrect'
                                                      : 'No answer'
                                            }
                                            title={
                                                isCorrect
                                                    ? 'Correct'
                                                    : chosen
                                                      ? 'Incorrect'
                                                      : 'No answer'
                                            }
                                            className={`review-badge ${chosen ? (isCorrect ? 'ok' : 'bad') : 'none'}`}
                                        >
                                            {isCorrect
                                                ? '✅'
                                                : chosen
                                                  ? '❌'
                                                  : '—'}
                                        </div>

                                        <div className="review-main">
                                            <div className="review-question">
                                                {item.question}
                                            </div>
                                            <div className="review-answers">
                                                <span className="review-label">
                                                    Your answer:
                                                </span>{' '}
                                                <strong
                                                    className={`answer-${chosen ? (isCorrect ? 'ok' : 'bad') : 'none'}`}
                                                >
                                                    {chosen ?? 'No answer'}
                                                </strong>
                                                <span className="sep">•</span>
                                                <span className="review-label">
                                                    Correct:
                                                </span>{' '}
                                                <strong>{correct}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                {/* === Footer actions (pinned) === */}
                <div className="results-actions">
                    <Link to="/play">
                        <button className="btn-primary">Play again</button>
                    </Link>
                    <Link to="/" className="back-home">
                        Home
                    </Link>
                </div>
            </div>
        </section>
    );
}
