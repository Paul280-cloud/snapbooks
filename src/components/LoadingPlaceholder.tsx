interface LoadingPlaceholderProps {
  type: 'cards' | 'bars';
  count?: number;
}

export default function LoadingPlaceholder({ type, count = 3 }: LoadingPlaceholderProps) {
  if (type === 'cards') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            data-testid="placeholder-card"
            className="bg-gray h-[72px] animate-pulse rounded-[8px]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          data-testid="placeholder-bar"
          className="bg-gray h-6 animate-pulse rounded"
        />
      ))}
    </div>
  );
}
