/** Product UI preview — Census targeting dashboard (replaces generic hero stock photo) */
export function LandingProductPreview() {
  return (
    <div className="relative w-full" aria-hidden>
      <div className="pointer-events-none absolute -inset-6 bg-[radial-gradient(ellipse_at_center,rgba(10,102,194,0.1),transparent_70%)]" />
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-xl)] lg:rounded-3xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)] px-4 py-3 sm:px-5 sm:py-3.5">
          <span className="text-micro font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Audience builder
          </span>
          <span className="inline-flex items-center gap-1.5 text-micro text-[var(--color-text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live ACS
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {["90210", "90212", "90024"].map((zip) => (
              <span
                key={zip}
                className="rounded-full bg-[var(--color-accent-subtle)] px-3 py-1 text-xs font-medium text-[var(--color-accent)]"
              >
                {zip}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric label="Households" value="~24,180" />
            <Metric label="Median income" value="$142k" />
            <Metric label="Population" value="58,420" />
            <Metric label="Mover rate" value="8.2%" />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-[var(--color-bg-dark)] px-4 py-3.5">
            <div>
              <p className="text-micro uppercase tracking-wide text-white/55">Est. campaign</p>
              <p className="text-lg font-semibold tracking-tight text-white">$4,836</p>
            </div>
            <p className="text-micro text-white/50">6×11 · 24k pcs</p>
          </div>
        </div>

        <div className="relative h-28 overflow-hidden border-t border-[var(--color-border)] bg-gradient-to-br from-[#e8eef4] via-[#f5f5f4] to-[#e2e8f0] sm:h-32">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(to right, #94a3b8 1px, transparent 1px),
                linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute inset-4 rounded-lg border-2 border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10" />
          <div className="absolute bottom-3 left-4 rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-[var(--color-text-muted)] shadow-sm">
            ZIP boundaries · Census ACS
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-3">
      <p className="text-micro mb-0.5 text-[var(--color-text-muted)]">{label}</p>
      <p className="text-base font-semibold tabular-nums tracking-tight text-[var(--color-bg-dark)]">
        {value}
      </p>
    </div>
  );
}
