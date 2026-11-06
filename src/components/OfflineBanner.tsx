interface OfflineBannerProps {
  offline: boolean;
}

export default function OfflineBanner({ offline }: OfflineBannerProps) {
  if (!offline) return null;

  return (
    <div
      role="alert"
      className="w-full bg-[#111827] px-4 py-2 text-center text-sm text-white"
    >
      You&apos;re offline. Changes will not be saved.
    </div>
  );
}
