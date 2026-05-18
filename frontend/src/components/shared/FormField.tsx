import { ReactNode } from 'react';

interface Props {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}

export default function FormField({ label, required, error, children, htmlFor }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="required-mark" aria-hidden>*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
