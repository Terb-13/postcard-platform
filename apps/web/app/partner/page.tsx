"use client";

import { useState } from "react";

interface Job {
  id: string;
  status: string;
  trackingNumber?: string;
  createdAt: string;
  campaign: {
    name: string;
    size: string;
    quantity: number;
  };
  events?: any[];
}

export default function PartnerPortal() {
  const [apiKey, setApiKey] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const fetchJobs = async (key: string) => {
    if (!key) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/production/jobs", {
        headers: { "x-production-key": key },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load jobs");
      }

      const data = await res.json();
      setJobs(data.jobs || []);
      setApiKey(key);
      localStorage.setItem("partnerApiKey", key);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load saved key on mount
  if (typeof window !== "undefined" && !apiKey) {
    const saved = localStorage.getItem("partnerApiKey");
    if (saved) {
      fetchJobs(saved);
    }
  }

  const updateStatus = async () => {
    if (!selectedJob || !apiKey || !newStatus) return;

    try {
      const res = await fetch(`/api/production/jobs/${selectedJob.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-production-key": apiKey,
        },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: tracking || undefined,
          message: message || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setMessage("Status updated successfully!");
      await fetchJobs(apiKey);
      setSelectedJob(null);
      setNewStatus("");
      setTracking("");
      setMessage("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const uploadProof = async () => {
    if (!selectedJob || !apiKey || !proofFile) return;

    // For simplicity, we'll use a placeholder URL.
    // In real app you'd upload to R2/UploadThing first and get a URL.
    const proofUrl = prompt("Enter public URL for the proof file (or implement real upload):");
    if (!proofUrl) return;

    try {
      const res = await fetch(`/api/production/jobs/${selectedJob.id}/proof`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-production-key": apiKey,
        },
        body: JSON.stringify({ proofUrl }),
      });

      if (!res.ok) throw new Error("Failed to upload proof");

      setMessage("Proof uploaded!");
      await fetchJobs(apiKey);
      setProofFile(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-semibold mb-2">Partner Portal</h1>
      <p className="text-gray-600 mb-8">View your assigned jobs and submit proofs &amp; status updates.</p>

      {!apiKey ? (
        <div className="max-w-md">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-medium mb-4">Enter your Partner API Key</h2>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 font-mono mb-4"
              placeholder="ppk_..."
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchJobs((e.target as HTMLInputElement).value);
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector("input") as HTMLInputElement;
                if (input) fetchJobs(input.value);
              }}
              className="w-full bg-black text-white py-2 rounded font-medium"
            >
              Load My Jobs
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Your API key was provided when you were onboarded as a production partner.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-sm text-gray-500">Connected as partner</span>
              <button
                onClick={() => {
                  localStorage.removeItem("partnerApiKey");
                  setApiKey("");
                  setJobs([]);
                }}
                className="ml-3 text-sm text-red-600 hover:underline"
              >
                Disconnect
              </button>
            </div>
            <button
              onClick={() => fetchJobs(apiKey)}
              className="text-sm border px-4 py-1.5 rounded hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

          <div className="grid gap-6">
            {jobs.length === 0 && !loading && (
              <div className="text-gray-500">No jobs assigned yet.</div>
            )}

            {jobs.map((job) => (
              <div key={job.id} className="bg-white border rounded-xl p-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{job.campaign.name}</h3>
                    <p className="text-sm text-gray-500">
                      {job.campaign.size} • Qty {job.campaign.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{job.status}</div>
                    {job.trackingNumber && (
                      <div className="text-xs text-blue-600 font-mono">{job.trackingNumber}</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="text-sm px-4 py-1.5 border rounded hover:bg-gray-50"
                  >
                    Manage Job
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Job Action Modal */}
          {selectedJob && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="font-semibold mb-1">Manage: {selectedJob.campaign.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Current status: {selectedJob.status}</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Select new status...</option>
                      <option value="SENT_TO_PROVIDER">Sent to Provider</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tracking number (if shipping)"
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      className="w-full mt-2 border rounded px-3 py-2 text-sm font-mono"
                    />
                    <button
                      onClick={updateStatus}
                      disabled={!newStatus}
                      className="mt-2 w-full bg-black text-white text-sm py-2 rounded disabled:opacity-50"
                    >
                      Update Status
                    </button>
                  </div>

                  <div className="border-t pt-4">
                    <label className="text-sm font-medium block mb-1">Upload Proof</label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload your proof file to a public URL first, then paste it below (or integrate real upload).
                    </p>
                    <button
                      onClick={uploadProof}
                      className="w-full border border-dashed py-3 text-sm rounded hover:bg-gray-50"
                    >
                      Upload / Submit Proof
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button onClick={() => setSelectedJob(null)} className="flex-1 border py-2 rounded text-sm">
                    Close
                  </button>
                </div>

                {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
