import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ForwardedRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef(function Input(
  { label, error, className = '', id, ...props }: InputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`w-full bg-[#0b132b]/80 border ${
          error ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-700 focus:border-[#d4af37] focus:ring-[#d4af37]/30'
        } rounded-md px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef(function Textarea(
  { label, error, className = '', id, ...props }: TextareaProps,
  ref: ForwardedRef<HTMLTextAreaElement>
) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={4}
        className={`w-full bg-[#0b132b]/80 border ${
          error ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-700 focus:border-[#d4af37] focus:ring-[#d4af37]/30'
        } rounded-md px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
});

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef(function Select(
  { label, options, error, className = '', id, ...props }: SelectProps,
  ref: ForwardedRef<HTMLSelectElement>
) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={`w-full bg-[#0b132b]/80 border ${
          error ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-700 focus:border-[#d4af37] focus:ring-[#d4af37]/30'
        } rounded-md px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0b132b] text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
});
