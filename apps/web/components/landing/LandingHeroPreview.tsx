/** Desktop-only decorative product preview — static Census-style metrics */
export function LandingHeroPreview() {
  return (
    <div
      className="hidden lg:block relative"
      aria-hidden
    >
      <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,rgba(10,102,194,0.08),transparent_70%)] pointer-events-none" />
      <div className="relative rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-xl)] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]">
          <span className="text-micro font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
            Audience preview
          </span>
          <span className="inline-flex items-center gap-1.5 text-micro text-[var(--color-text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live ACS
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {["90210", "90212", "90024"].map((zip) => (
              <span
                key={zip}
                className="rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] px-3 py-1 text-xs font-medium"
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

          <div className="rounded-xl bg-[var(--color-bg-dark)] px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-micro text-white/55 uppercase tracking-wide">Est. campaign</p>
              <p className="text-lg font-semibold text-white tracking-tight">$4,836</p>
            </div>
            <p className="text-micro text-white/50">6×11 · 24k pcs</p>
          </div>
        </div>

        <div className="h-32 bg-gradient-to-br from-[#e8eef4] via-[#f5f5f4] to-[#e2e8f0] border-t border-[var(--color-border)] relative overflow-hidden">
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
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-3">
      <p className="text-micro text-[var(--color-text-muted)] mb-0.5">{label}</p>
      <p className="text-base font-semibold text-[var(--color-bg-dark)] tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}
