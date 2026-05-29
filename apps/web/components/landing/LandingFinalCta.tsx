import Link from "next/link";
import { AuthButtons } from "./AuthButtons";

export function LandingFinalCta() {
  return (
    <>
      <section className="py-12 sm:py-16 bg-white border-t border-[var(--color-border)]">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-6 py-8 sm:px-10 sm:py-10">
            <div className="max-w-xl text-center lg:text-left">
              <p className="landing-eyebrow mb-2">For print partners</p>
              <h3 className="heading-md text-[var(--color-bg-dark)] mb-2">Running a print shop?</h3>
              <p className="text-[var(--color-text-secondary)]">
                Dedicated partner portal with proofing, job status, and production visibility.
              </p>
            </div>
            <Link href="/partner" className="btn-secondary shrink-0 w-full sm:w-auto justify-center">
              Explore partner platform
            </Link>
          </div>
        </div>
      </section>

      <section className="dark-section section">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <p className="landing-eyebrow text-white/50 mb-4">Ready when you are</p>
            <h2 className="heading-xl text-white tracking-[-0.03em] mb-4">
              Start your first targeted campaign
            </h2>
            <p className="body-lg text-white/70 mb-9 max-w-lg mx-auto">
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
