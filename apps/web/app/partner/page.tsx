"use client";

import { useState, useEffect } from "react";
import { UploadButton } from "@/lib/uploadthing";

interface Job {
  id: string;
  status: string;
  trackingNumber?: string;
  createdAt: string;
  proofUrl?: string;
  proofApprovedAt?: string;
  campaign: {
    name: string;
    size: string;
    quantity: number;
  };
  events?: Array<{
    id: string;
    status: string;
    note?: string;
    createdAt: string;
  }>;
}

export default function PartnerPortal() {
  const [apiKey, setApiKey] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [proofUrlInput, setProofUrlInput] = useState("");
  const [note, setNote] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // Load saved key
  useEffect(() => {
    const saved = localStorage.getItem("partnerApiKey");
    if (saved && !apiKey) {
      setApiKey(saved);
      fetchJobs(saved);
    }
  }, []);

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
          message: note || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setActionMessage("Status updated successfully!");
      await fetchJobs(apiKey);
      setSelectedJob(null);
      resetActionForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const submitProofWithUrl = async (url: string) => {
    if (!selectedJob || !apiKey) return;

    try {
      const res = await fetch(`/api/production/jobs/${selectedJob.id}/proof`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-production-key": apiKey,
        },
        body: JSON.stringify({ proofUrl: url }),
      });

      if (!res.ok) throw new Error("Failed to submit proof");

      setActionMessage("Proof submitted successfully!");
      await fetchJobs(apiKey);
      setSelectedJob(null);
      resetActionForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const submitProof = async () => {
    if (!proofUrlInput) return;
    await submitProofWithUrl(proofUrlInput);
  };

  const resetActionForm = () => {
    setNewStatus("");
    setTracking("");
    setProofUrlInput("");
    setNote("");
    setActionMessage("");
  };

  const openJob = (job: Job) => {
    setSelectedJob(job);
    setActionMessage("");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Partner Portal</h1>
          <p className="text-gray-600 mt-1">Manage your assigned postcard production jobs</p>
        </div>
        {apiKey && (
          <button
            onClick={() => {
              localStorage.removeItem("partnerApiKey");
              setApiKey("");
              setJobs([]);
              setSelectedJob(null);
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Disconnect
          </button>
        )}
      </div>

      {!apiKey ? (
        <div className="max-w-md mx-auto mt-12">
          <div className="bg-white border rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Welcome, Print Partner</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Enter your API key to access your jobs.
            </p>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-3 font-mono text-sm mb-4"
              placeholder="ppk_..."
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchJobs((e.target as HTMLInputElement).value.trim());
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector("input") as HTMLInputElement;
                if (input?.value) fetchJobs(input.value.trim());
              }}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition"
            >
              Access My Jobs
            </button>
            <p className="text-[11px] text-gray-500 mt-4 text-center">
              Your API key was provided during partner onboarding.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => fetchJobs(apiKey)}
              disabled={loading}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh Jobs"}
            </button>
            <span className="text-xs text-gray-500">API key connected</span>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {jobs.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500">No active jobs at the moment.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border rounded-2xl p-5 hover:shadow-sm transition cursor-pointer"
                  onClick={() => openJob(job)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold">{job.campaign.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {job.campaign.size} • {job.campaign.quantity.toLocaleString()} pcs
                      </div>
                    </div>
                    <div className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                      {job.status.replace(/_/g, " ")}
                    </div>
                  </div>

                  {job.trackingNumber && (
                    <div className="text-xs font-mono text-blue-600 mb-2">Tracking: {job.trackingNumber}</div>
                  )}

                  {job.proofUrl && (
                    <div className="text-xs text-emerald-600 mb-1">
                      Proof submitted {job.proofApprovedAt ? "✓" : ""}
                    </div>
                  )}

                  <div className="text-[10px] text-gray-400 mt-3">
                    Created {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Job Detail Modal */}
          {selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                  <div>
                    <div className="font-semibold text-lg">{selectedJob.campaign.name}</div>
                    <div className="text-sm text-gray-500">
                      {selectedJob.campaign.size} • Qty {selectedJob.campaign.quantity}
                    </div>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="text-2xl leading-none">×</button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <div className="text-sm font-medium mb-1.5">Current Status</div>
                    <div className="inline-block px-3 py-1 bg-gray-100 rounded text-sm">{selectedJob.status}</div>
                    {selectedJob.trackingNumber && (
                      <div className="mt-1 text-sm font-mono text-blue-600">Tracking: {selectedJob.trackingNumber}</div>
                    )}
                  </div>

                  {/* Status Update */}
                  <div>
                    <div className="text-sm font-medium mb-2">Update Status</div>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
                    >
                      <option value="">Select status...</option>
                      <option value="SENT_TO_PROVIDER">Sent to Provider</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tracking number (for SHIPPED)"
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm font-mono mb-2"
                    />
                    <button
                      onClick={updateStatus}
                      disabled={!newStatus}
                      className="w-full bg-black text-white text-sm py-2.5 rounded-lg disabled:opacity-50"
                    >
                      Update Status
                    </button>
                  </div>

                  {/* Proof Upload - Real UploadThing */}
                  <div>
                    <div className="text-sm font-medium mb-2">Submit Proof</div>

                    <UploadButton
                      endpoint="artworkUploader"
                      onClientUploadComplete={(res) => {
                        if (res?.[0]?.url) {
                          setProofUrlInput(res[0].url);
                          // Auto-submit after successful upload
                          submitProofWithUrl(res[0].url);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        setError(`Upload failed: ${error.message}`);
                      }}
                    />

                    {proofUrlInput && (
                      <div className="mt-2 text-xs text-green-600">
                        File uploaded: {proofUrlInput.split('/').pop()}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-500 mt-1">
                      Upload PDF or image proof directly.
                    </p>
                  </div>

                  {/* Recent Events */}
                  {selectedJob.events && selectedJob.events.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Recent Activity</div>
                      <div className="text-xs space-y-1 text-gray-600">
                        {selectedJob.events.map((ev, i) => (
                          <div key={i}>
                            {ev.status} — {ev.note || "No note"} ({new Date(ev.createdAt).toLocaleDateString()})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t sticky bottom-0 bg-white">
                  <button
                    onClick={() => {
                      setSelectedJob(null);
                      resetActionForm();
                    }}
                    className="w-full py-2 text-sm border rounded-lg"
                  >
                    Close
                  </button>
                  {actionMessage && <div className="text-center text-sm text-green-600 mt-3">{actionMessage}</div>}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
