import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <h1 className="text-6xl font-semibold tracking-tight mb-6">
              Postcards that actually get results.
            </h1>
            <p className="text-2xl text-gray-300 mb-10">
              The modern platform for local businesses to design, target, and send high-performing EDDM postcards.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/campaigns/new"
                className="inline-block bg-white text-black px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-100 transition"
              >
                Start a Campaign
              </Link>
              <Link
                href="/partner"
                className="inline-block border border-white/60 hover:bg-white/10 px-8 py-4 rounded-xl font-medium text-lg transition"
              >
                I'm a Print Partner
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              No design agency. No long lead times. Just results.
            </p>
          </div>
        </div>
      </div>

      {/* How it works for customers */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-gray-100 rounded-full text-sm font-medium mb-4">For Businesses</div>
          <h2 className="text-4xl font-semibold">Send postcards in minutes, not weeks.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Create & Design",
              desc: "Upload your PDF or get instant AI-generated concepts and copy suggestions powered by xAI.",
            },
            {
              step: "02",
              title: "Target & Pay",
              desc: "Choose your area, quantity, and drop date. Pay securely with Stripe. We handle the rest.",
            },
            {
              step: "03",
              title: "Track Everything",
              desc: "Watch your job move through production in real time. Get notified when it ships with tracking.",
            },
          ].map((item, i) => (
            <div key={i} className="border rounded-2xl p-8">
              <div className="text-5xl font-semibold text-gray-200 mb-4">{item.step}</div>
              <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/campaigns/new" className="text-lg font-medium underline underline-offset-4">
            Start your first campaign →
          </Link>
        </div>
      </div>

      {/* For Print Partners */}
      <div className="bg-gray-50 border-y">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1 bg-white rounded-full text-sm font-medium mb-4 border">For Print Partners</div>
              <h2 className="text-4xl font-semibold mb-6">A better way to receive and fulfill jobs.</h2>
              <ul className="space-y-3 text-lg text-gray-700">
                <li>✓ Get jobs instantly via our secure API</li>
                <li>✓ Simple self-service portal to view jobs, upload proofs, and update status</li>
                <li>✓ Direct file uploads for proofs (no more email chains)</li>
                <li>✓ Real-time visibility for your customers</li>
              </ul>
              <div className="mt-8">
                <Link href="/partner" className="inline-block bg-black text-white px-8 py-4 rounded-xl font-medium">
                  Access Partner Portal
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl border p-8 text-sm">
              <div className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-2">For Print Vendors</div>
              <div className="space-y-4 text-gray-600">
                <p>Our partner API and portal are built for real production workflows. Upload proofs, push status updates, and keep customers in the loop — all in one place.</p>
                <p className="font-medium text-black">Simple API key authentication. No complex onboarding.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ops / Internal */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-gray-100 rounded-full text-sm font-medium mb-4">For Your Team</div>
          <h2 className="text-4xl font-semibold">Full control and visibility.</h2>
          <p className="mt-3 text-xl text-gray-600 max-w-md mx-auto">
            Powerful internal tools so you never lose track of a job again.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            "Rich job dashboard with filters, search, and cursor pagination",
            "Artwork + Proof review directly in the job drawer",
            "One-click status updates, reassign, and internal notes",
            "Automatic partner assignment + full audit trail",
            "Real analytics (turnaround times, status breakdowns)",
            "Instant creation of new production partners",
          ].map((feature, i) => (
            <div key={i} className="flex gap-3 text-lg border rounded-2xl p-6">
              <div className="mt-1 text-emerald-600">✓</div>
              <div>{feature}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/ops" className="text-lg font-medium underline underline-offset-4">
            View Ops Dashboard (login required) →
          </Link>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="bg-black text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-semibold mb-4">Ready to send better postcards?</h2>
          <p className="text-gray-400 mb-8">Create your first campaign in under 2 minutes.</p>
          <Link
            href="/campaigns/new"
            className="inline-block bg-white text-black px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200 transition"
          >
            Get Started Free
          </Link>
          <p className="mt-4 text-xs text-gray-500">No credit card required to start. Pay only when you send.</p>
        </div>
      </div>
    </div>
  );
}
