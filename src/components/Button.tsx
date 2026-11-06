import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export default function Button({
  variant,
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    'w-full rounded-[6px] font-semibold text-base transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7F4F] focus-visible:ring-offset-1';

  const variants: Record<string, string> = {
    primary: isDisabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-[#1B7F4F] text-white hover:bg-[#166B41] active:bg-[#145F3A]',
    secondary: isDisabled
      ? 'border border-gray-300 text-gray-400 cursor-not-allowed'
      : 'border border-[#1B7F4F] text-[#1B7F4F] hover:bg-[#1B7F4F]/10',
    danger: isDisabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B]',
  };

  return (
    <button
      style={{ height: '48px' }}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span
          data-testid="button-spinner"
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      ) : (
        children
      )}
    </button>
  );
}
