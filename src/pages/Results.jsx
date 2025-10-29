import { Link, Navigate } from 'react-router-dom';
import { useQuizCtx } from '../context/QuizContext';

export default function Results() {
    const { result } = useQuizCtx();

    // if no finished result, send to Home
    if (!result) return <Navigate to="/" replace />;

    const { score, total, review } = result;

    return (
        <div
            style={{
                background: '#f2f4f7',
                minHeight: '100vh',
                padding: '32px 16px',
            }}
        >
            <section
                style={{
                    maxWidth: 760,
                    margin: '0 auto',
                }}
            >
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 12,
                        boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
                        padding: 24,
                    }}
                >
                    <h1 style={{ paddingBottom: 16 }}>Results</h1>

                    <p style={{ paddingTop: 10, fontSize: 16 }}>
                        Score: <strong>{score}</strong> /{' '}
                        <strong>{total}</strong>
                    </p>

                    {/* Divider + Review block */}
                    <div
                        style={{
                            paddingTop: 20,
                            borderTop: '1px solid rgba(0,0,0,0.06)',
                        }}
                    >
                        <h3 style={{ paddingBottom: 8 }}>Review</h3>

                        <ol style={{ paddingLeft: 18 }}>
                            {review.map((item, idx) => {
                                const correct = item.answers.find(
                                    a => a.id === item.correctId
                                ).label;
                                const chosen = item.selectedId
                                    ? item.answers.find(
                                          a => a.id === item.selectedId
                                      ).label
                                    : null;
                                const isCorrect =
                                    chosen != null &&
                                    item.selectedId === item.correctId;

                                return (
                                    <li
                                        key={idx}
                                        style={{
                                            padding: '10px 0',
                                            borderBottom:
                                                idx < review.length - 1
                                                    ? '1px dashed rgba(0,0,0,0.06)'
                                                    : 'none',
                                        }}
                                    >
                                        {/* question text (HTML entities may still be raw for now) */}
                                        <div
                                            style={{
                                                paddingBottom: 6,
                                            }}
                                        >
                                            {item.question}
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: 16,
                                                flexWrap: 'wrap',
                                                alignItems: 'center',
                                                paddingTop: 2,
                                            }}
                                        >
                                            <div
                                                aria-label={
                                                    isCorrect
                                                        ? 'Correct'
                                                        : 'Incorrect'
                                                }
                                                title={
                                                    isCorrect
                                                        ? 'Correct'
                                                        : 'Incorrect'
                                                }
                                                style={{ fontSize: 18 }}
                                            >
                                                {isCorrect ? '✅' : '❌'}
                                            </div>

                                            <div>
                                                Your answer:{' '}
                                                <strong
                                                    style={{
                                                        color: chosen
                                                            ? isCorrect
                                                                ? '#199a50'
                                                                : '#c23b3b'
                                                            : '#8a8f98',
                                                    }}
                                                >
                                                    {chosen ?? 'No answer'}
                                                </strong>
                                            </div>

                                            <div>
                                                Correct answer:{' '}
                                                <strong>{correct}</strong>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: 10,
                            paddingTop: ' 30px',
                        }}
                    >
                        <Link to="/play">
                            <button
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    border: '1px solid #d0d5dd',
                                    backgroundColor: 'navy',
                                    color: 'white',
                                    cursor: 'pointer',
                                }}
                            >
                                Play again
                            </button>
                        </Link>

                        <Link to="/" style={{ alignSelf: 'center' }}>
                            Home
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
