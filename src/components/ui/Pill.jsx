export default function Pill({ label, value, className = '', ...rest }) {
    return (
        <div className={`score-pill ${className}`.trim()} {...rest}>
            <span>{label}</span>
            <span className="sep">·</span>
            <strong>{value}</strong>
        </div>
    );
}
