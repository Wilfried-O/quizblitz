export default function Button({
    variant = 'secondary', // 'primary' | 'secondary' | 'ghost'
    type = 'button',
    className = '',
    children,
    ...rest
}) {
    const v = ['primary', 'secondary', 'ghost'].includes(variant)
        ? variant
        : 'secondary';
    const cls = `btn btn-${v} ${className}`.trim();
    return (
        <button type={type} className={cls} {...rest}>
            {children}
        </button>
    );
}
