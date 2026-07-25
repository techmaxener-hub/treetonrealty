// Hand-rolled vertical bar chart for a date-bucketed series -- same
// no-dependency approach as ReportBarList. Bar height is relative to the
// series max; the value shows on hover via the native title attribute
// rather than a custom tooltip, to keep this a plain, dependency-free
// component.
export function ReportTimeSeries({
  points,
  valueFormatter = (n: number) => String(n),
  emptyMessage = "No data yet.",
}: {
  points: { label: string; value: number }[];
  valueFormatter?: (value: number) => string;
  emptyMessage?: string;
}) {
  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <div className="flex h-32 items-end gap-1.5">
      {points.map((point, i) => (
        <div key={`${point.label}-${i}`} className="flex flex-1 flex-col items-center gap-1" title={`${point.label}: ${valueFormatter(point.value)}`}>
          <div className="flex h-24 w-full items-end">
            <div
              className="w-full min-h-[2px] rounded-t-sm bg-primary transition-[height]"
              style={{ height: `${(point.value / max) * 100}%` }}
            />
          </div>
          <span className="truncate text-[10px] text-muted-foreground">{point.label}</span>
        </div>
      ))}
    </div>
  );
}
