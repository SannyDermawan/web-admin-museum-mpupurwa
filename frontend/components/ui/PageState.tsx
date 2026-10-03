import { Button } from "@/components/ui/Button";

/** Shown while a page is waiting for its API call. */
export function LoadingState({ label = "Memuat data…" }: { label?: string }) {
  return (
    <div role="status" className="px-[22px] py-12 text-center text-[13px] text-ink-soft">
      {label}
    </div>
  );
}

/** Shown when an API call failed. Pass `onRetry` to show a retry button. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-[22px] py-12 text-center">
      <p className="text-[13px] text-danger">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Coba lagi
        </Button>
      )}
    </div>
  );
}

/** Shown when a list is empty. */
export function EmptyState({ message }: { message: string }) {
  return <div className="px-[22px] py-12 text-center text-[13px] text-ink-soft">{message}</div>;
}
