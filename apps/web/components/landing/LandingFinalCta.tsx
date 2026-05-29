import Link from "next/link";
import { AuthButtons } from "./AuthButtons";

export function LandingFinalCta() {
  return (
    <>
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-t border-[var(--color-border)]">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 rounded-2xl lg:rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12 max-w-5xl lg:max-w-none mx-auto lg:mx-0">
            <div className="max-w-xl text-center lg:text-left">
              <p className="landing-eyebrow mb-2">For print partners</p>
              <h3 className="heading-md text-[var(--color-bg-dark)] mb-3">Running a print shop?</h3>
              <p className="landing-body text-[var(--color-text-secondary)]">
                Dedicated partner portal with proofing, job status, and production visibility.
              </p>
            </div>
            <Link
              href="/partner"
              className="btn-secondary shrink-0 w-full sm:w-auto justify-center lg:min-w-[220px]"
            >
              Explore partner platform
            </Link>
          </div>
        </div>
      </section>

      <section className="dark-section section section-rhythm">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <p className="landing-eyebrow text-white/50 mb-4 lg:mb-5">Ready when you are</p>
            <h2 className="landing-section-title text-white mb-4 lg:mb-5">
              Start your first targeted campaign
            </h2>
            <p className="landing-hero-lead text-white/70 mb-9 lg:mb-11 max-w-xl mx-auto">
              Explore the map free. Launch when your audience and cost look right — pay only for
              the postcards you send.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AuthButtons variant="final" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
