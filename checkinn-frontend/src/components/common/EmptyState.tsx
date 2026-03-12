import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-lg font-medium text-[var(--color-text)]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-xs">
          {description}
        </p>
      )}
    </div>
  );
}
