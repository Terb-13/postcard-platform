import { AuthButtons } from "./AuthButtons";

export function LandingFinalCta() {
  return (
    <section className="dark-section section">
      <div className="container text-center">
        <div className="max-w-2xl mx-auto">
          <p className="landing-eyebrow text-white/50 mb-4">Get started</p>
          <h2 className="landing-section-title text-white mb-4">
            Ready to target with real Census data?
          </h2>
          <p className="landing-section-desc mx-auto mb-10 max-w-lg text-white/70">
            Start free, explore the live map, and launch your first campaign when your audience
            and cost look right.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AuthButtons variant="final" />
          </div>
        </div>
      </div>
    </section>
  );
}
