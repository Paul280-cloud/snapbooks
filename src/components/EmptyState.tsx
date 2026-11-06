interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <svg
        aria-hidden="true"
        className="h-16 w-16 text-[#6B7280]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        viewBox="0 0 64 64"
      >
        <rect x="8" y="12" width="48" height="40" rx="4" />
        <line x1="20" y1="28" x2="44" y2="28" />
        <line x1="20" y1="36" x2="36" y2="36" />
      </svg>
      <p className="text-base text-[#6B7280]">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-[6px] bg-[#1B7F4F] px-6 py-2 text-base font-semibold text-white hover:bg-[#166B41]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
