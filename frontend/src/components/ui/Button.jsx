const VARIANTS = {
  primary:
    'bg-send text-white hover:bg-send-dark hover:shadow-md hover:-translate-y-px active:translate-y-0 active:scale-[0.98] shadow-sm',
  secondary:
    'bg-white text-ink border border-line hover:border-ink/20 hover:bg-ink/[0.02] hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
  ghost:
    'text-muted hover:text-ink hover:bg-ink/[0.04] active:scale-[0.98]',
  danger:
    'bg-white text-coral border border-coral/30 hover:bg-coral-light active:scale-[0.98]',
};

const Button = ({ variant = 'primary', className = '', children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ease-out disabled:opacity-40 disabled:pointer-events-none disabled:hover:translate-y-0 ${VARIANTS[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
