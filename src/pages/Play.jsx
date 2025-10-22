import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchOpenTdbRaw } from '../services/opentdb';

export default function Play() {
    const [params] = useSearchParams();
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const amount = Number(params.get('amount') ?? 10);
    const difficulty = params.get('difficulty') ?? '';
    const category = params.get('category') ?? '';

    useEffect(() => {
        const ctrl = new AbortController();
        setStatus('loading');
        setError(null);

        fetchOpenTdbRaw({ amount, difficulty, category, signal: ctrl.signal })
            .then(json => {
                setData(json);
                setStatus('ready');
            })
            .catch(err => {
                if (err?.name === 'AbortError') {
                    //console.log(`Aborted: ${err.message}`);
                    return;
                } // ignore cancels (StrictMode/dev or param changes)
                setError(err?.message || 'Failed to load');
                setStatus('error');
            });

        // on unmount or before next run (e.g., params change), abort the in-flight fetch
        return () => ctrl.abort();
    }, [amount, difficulty, category]);

    if (status === 'loading') return <p>Loading…</p>;
    if (status === 'error')
        return <p style={{ color: 'salmon' }}>Error: {error}</p>;

    return (
        <section>
            <h2>Raw Open Trivia DB Response</h2>
            <pre
                style={{
                    background: '#0e142b',
                    color: '#e7e7ea',
                    padding: 12,
                    borderRadius: 8,
                    overflowX: 'auto',
                }}
            >
                {JSON.stringify(data, null, 2)}
            </pre>
        </section>
    );
}
