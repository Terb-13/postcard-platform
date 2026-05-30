/** Data-driven trust panel — replaces generic stock photography in Results section */
export function LandingTrustMetrics() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)] px-5 py-3.5">
        <span className="text-micro font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Census audience snapshot
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
          ACS 5-yr
        </span>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
        <StatBlock label="ZIPs selected" value="3" sub="Precision geo-targeting" />
        <StatBlock label="Est. reach" value="24,180" sub="Households" />
        <StatBlock label="Median income" value="$142k" sub="Across selection" />
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]/50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Authoritative Census data — not broker lists or guesswork.
          </p>
          <p className="font-mono text-xs font-semibold text-[var(--color-accent)]">
            Transparent before print
          </p>
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4">
      <p className="text-micro text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-[var(--color-bg-dark)]">
        {value}
      </p>
      <p className="mt-1 text-micro text-[var(--color-text-muted)]">{sub}</p>
    </div>
  );
}
