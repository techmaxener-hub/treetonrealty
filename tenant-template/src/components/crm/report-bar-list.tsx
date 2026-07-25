// Hand-rolled horizontal bar list -- no charting dependency. Every bar's
// width is relative to the largest value in the set, which is enough for
// funnels/breakdowns/leaderboards without pulling in a chart library for
// a handful of report widgets.
export function ReportBarList({
  items,
  valueFormatter = (n: number) => String(n),
  emptyMessage = "No data yet.",
}: {
  items: { label: string; value: number; sublabel?: string }[];
  valueFormatter?: (value: number) => string;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">
              {item.label}
              {item.sublabel && <span className="ml-1.5 text-xs font-normal text-muted-foreground">{item.sublabel}</span>}
            </span>
            <span className="tabular-nums text-muted-foreground">{valueFormatter(item.value)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
