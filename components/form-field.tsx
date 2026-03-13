import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  children?: ReactNode;
  as?: 'input' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  helpText?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  error,
  value,
  onChange,
  children,
  as = 'input',
  options,
  helpText,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {as === 'input' && (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            error
              ? 'border-destructive focus:ring-destructive focus:ring-offset-background'
              : 'border-border bg-input hover:border-primary/30 focus:border-primary focus:ring-primary/20 focus:ring-offset-background'
          }`}
        />
      )}

      {as === 'textarea' && (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full resize-none rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            error
              ? 'border-destructive focus:ring-destructive focus:ring-offset-background'
              : 'border-border bg-input hover:border-primary/30 focus:border-primary focus:ring-primary/20 focus:ring-offset-background'
          }`}
          rows={4}
        />
      )}

      {as === 'select' && (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            error
              ? 'border-destructive focus:ring-destructive focus:ring-offset-background'
              : 'border-border bg-input hover:border-primary/30 focus:border-primary focus:ring-primary/20 focus:ring-offset-background'
          }`}
        >
          <option value="">Select an option</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {children}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {helpText && !error && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
}
