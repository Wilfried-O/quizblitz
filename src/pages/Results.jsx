import Pill from '../components/ui/Pill';
import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuizCtx } from '../context/QuizContext';

export default function Results() {
    const { result } = useQuizCtx();

    useEffect(() => {
        if (!result) {
            // No data yet (or user navigated directly)
            document.title = 'QuizBlitz - Results';
            return () => {
                document.title = 'QuizBlitz';
            };
        }
        document.title = `QuizBlitz - Results (${result.score}/${result.total})`;
        return () => {
            document.title = 'QuizBlitz';
        };
    }, [result]);

    // Guard: if no result, bounce to Home
    if (!result) return <Navigate to="/" replace />;

    const { score, total, review } = result;

    return (
        <section className="results-page">
            <div className="results-card results-flex">
                <div className="results-header">
                    <h1 className="page-title">Results</h1>

                    <div className="results-meta">
                        <Pill
                            label="Final Score"
                            value={`${score} / ${total}`}
                            aria-label={`Score ${score} out of ${total}`}
                        />
                    </div>
                </div>

                {/* === Scrollable review panel === */}
                <div className="results-scroll">
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
                    <Link
                        to="/play"
                        className="btn btn-primary with-transition"
                    >
                        Play again
                    </Link>
                    <Link to="/" className="back-home">
                        Back to settings
                    </Link>
                </div>
            </div>
        </section>
    );
}
