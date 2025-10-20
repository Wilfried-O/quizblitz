export default function AppHeader({ logoSize = 50, wordmarkSize = 32 }) {
    return (
        <header className="qz-header" aria-label="QuizBlitz">
            <Logo size={logoSize} />
            <WordMark text="QuizBlitz" size={wordmarkSize} />
        </header>
    );
}

/** Transparent Q-Bolt (Magma Peach) */
function Logo({ size = 28, title = 'QuizBlitz logo' }) {
    const id = 'qzMagmaLogo';
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            role="img"
            aria-label={title}
        >
            <defs>
                <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#FF006E" />
                    <stop offset="1" stopColor="#FFB86B" />
                </linearGradient>
            </defs>
            <g
                fill="none"
                stroke={`url(#${id})`}
                strokeWidth="2.2"
                strokeLinecap="round"
            >
                <circle cx="16" cy="16" r="8.5" />
                <path d="M20.5 20.5l3 3" />
            </g>
            <path
                d="M17.8 10.8l-4.3 6.2h3.1l-1.5 5.2 4.7-7.1h-2z"
                fill={`url(#${id})`}
            />
        </svg>
    );
}

/**
 * Gradient wordmark using background-clip.
 * `size` controls font-size so you can match the logo visually.
 */
function WordMark({ text = 'QuizBlitz', size = 32 }) {
    return (
        <h1
            className="qz-wordmark"
            style={{
                margin: 0,
                fontSize: size,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: '0.4px',
                background: 'linear-gradient(90deg,#FF006E,#FFB86B)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent', // Safari fix
            }}
        >
            {text}
        </h1>
    );
}
