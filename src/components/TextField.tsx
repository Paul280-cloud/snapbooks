import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'password';
  error?: string;
}

export default function TextField({
  label,
  name,
  type = 'text',
  error,
  id,
  ...rest
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = id ?? name;
  const resolvedType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-[#111827]">
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          name={name}
          type={resolvedType}
          className={[
            'w-full rounded-[6px] border px-3 py-2 text-base text-[#111827] outline-none',
            'focus-visible:ring-2 focus-visible:ring-[#1B7F4F] focus-visible:border-[#1B7F4F]',
            error
              ? 'border-error border-[#DC2626]'
              : 'border-gray-300 focus:border-[#1B7F4F]',
            type === 'password' ? 'pr-10' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...rest}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]"
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-[#DC2626]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
