import { type SelectHTMLAttributes } from 'react';

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function SelectField({
  label,
  name,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  error,
  id,
  ...rest
}: SelectFieldProps) {
  const fieldId = id ?? name;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-[#111827]">
        {label}
      </label>
      <select
        id={fieldId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'w-full rounded-[6px] border px-3 py-2 text-base text-[#111827] outline-none',
          'focus-visible:ring-2 focus-visible:ring-[#1B7F4F]',
          error ? 'border-[#DC2626]' : 'border-gray-300',
        ].join(' ')}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-[#DC2626]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
