import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 32, className = "" }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2
        size={size}
        className="animate-spin text-[var(--color-primary)]"
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2
          size={40}
          className="animate-spin text-[var(--color-primary)]"
        />
        <span className="text-sm text-[var(--color-text-muted)]">
          Carregando...
        </span>
      </div>
    </div>
  );
}
