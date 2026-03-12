import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-lg border border-[var(--color-secondary)]
            bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]
            transition-all duration-200
            ${error ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]/30" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs text-[var(--color-danger)]">{error}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
