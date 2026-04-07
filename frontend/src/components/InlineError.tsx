type InlineErrorProps = {
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function InlineError({ message, retryLabel = "Try again", onRetry, className = "" }: InlineErrorProps) {
  return (
    <div
      className={`rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 ${className}`.trim()}
      role="alert"
    >
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-100"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
