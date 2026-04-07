type LoadingStateProps = {
  message?: string;
  size?: "sm" | "md";
  className?: string;
};

const SIZE_CLASS: Record<NonNullable<LoadingStateProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-[3px]",
};

export function LoadingState({
  message = "Loading...",
  size = "md",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`flex items-center gap-3 text-slate-600 ${className}`.trim()} aria-live="polite">
      <span
        className={`inline-block animate-spin rounded-full border-slate-300 border-t-slate-700 ${SIZE_CLASS[size]}`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
