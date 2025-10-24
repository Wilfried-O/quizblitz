import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NotFound() {
    const { pathname } = useLocation(); // show which path failed
    const h1Ref = useRef(null);

    useEffect(() => {
        //  move focus to the heading for screen readers
        h1Ref.current?.focus();
    }, []);

    return (
        <section style={{ padding: 24 }}>
            <h1 ref={h1Ref} style={{ marginTop: 0 }}>
                404 - Page not found
            </h1>

            <p style={{ opacity: 0.85 }}>
                We couldn&apos;t find{' '}
                <code
                    style={{
                        background: 'rgba(0,0,0,0.06)',
                        padding: '0 4px',
                        borderRadius: 4,
                        color: '#111',
                    }}
                >
                    {pathname}
                </code>
                .
            </p>

            <div style={{ marginTop: 12 }}>
                <Link to="/">Go back Home</Link>
            </div>
        </section>
    );
}
