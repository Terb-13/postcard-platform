import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </div>

      <h1 className="text-3xl font-semibold text-gray-900 mb-3">
        Payment Successful!
      </h1>

      <p className="text-gray-600 mb-8">
        Thank you. Your campaign has been paid for and is now in production. 
        Our team (or the assigned print partner) will begin working on it shortly.
      </p>

      <div className="space-y-3">
        <Link
          href="/production"
          className="block w-full rounded-lg bg-black py-3 text-white font-medium hover:bg-gray-800"
        >
          View My Production Jobs
        </Link>
        <Link
          href="/campaigns"
          className="block w-full rounded-lg border py-3 text-gray-700 font-medium hover:bg-gray-50"
        >
          Back to My Campaigns
        </Link>
      </div>

      <p className="mt-8 text-xs text-gray-500">
        You will receive an email confirmation shortly.
      </p>
    </div>
  );
}
