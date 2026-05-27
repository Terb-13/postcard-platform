"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";

export default function NewCampaignPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    size: "6x11",
    quantity: 500,
    dropDate: "",
  });

  const createCampaign = trpc.campaign.create.useMutation({
    onSuccess: (campaign) => {
      alert("Campaign created successfully!");
      router.push("/campaigns");
    },
    onError: (err) => alert("Error: " + err.message),
  });

  const generateConcepts = trpc.campaign.generateConcepts.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaign.mutate(form);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold mb-6">Create New Campaign</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Campaign Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border px-3 py-2"
            placeholder="e.g. Spring 2026 Postcard Drop"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Postcard Size</label>
            <select
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full rounded border px-3 py-2"
            >
              <option value="6x11">6x11 (EDDM)</option>
              <option value="4x6">4x6</option>
              <option value="5x7">5x7</option>
              <option value="6x9">6x9</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min={100}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Desired Drop Date (optional)</label>
          <input
            type="date"
            value={form.dropDate}
            onChange={(e) => setForm({ ...form, dropDate: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        {/* xAI Quick Ideas */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => {
              if (form.name) {
                generateConcepts.mutate({ prompt: `Create 3 high-converting postcard concepts and headlines for a local business campaign named "${form.name}". Include suggested design ideas and copy.` });
              }
            }}
            disabled={generateConcepts.isPending || !form.name}
            className="text-sm px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {generateConcepts.isPending ? "Generating with xAI..." : "Get AI Postcard Ideas (xAI)"}
          </button>

          {generateConcepts.data && (
            <div className="mt-3 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap border">
              {generateConcepts.data.result}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={createCampaign.isPending}
            className="w-full py-3 bg-black text-white rounded font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            Create Campaign
          </button>
          <p className="text-xs text-center text-gray-500 mt-3">
            You can send it to production after creation.
          </p>
        </div>
      </form>
    </div>
  );
}
