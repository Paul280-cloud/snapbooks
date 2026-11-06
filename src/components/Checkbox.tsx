import { type ReactNode } from 'react';

interface CheckboxProps {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}

export default function Checkbox({ name, checked, onChange, children }: CheckboxProps) {
  return (
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 cursor-pointer accent-[#1B7F4F]"
      />
      <label
        htmlFor={name}
        className="cursor-pointer text-base text-[#111827]"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'A') {
            e.preventDefault();
          }
        }}
      >
        {children}
      </label>
    </div>
  );
}
