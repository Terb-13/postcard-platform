"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

interface CreatePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePartnerModal({ isOpen, onClose, onSuccess }: CreatePartnerModalProps) {
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = trpc.admin.partners.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      reset();
    },
  });

  const reset = () => {
    setName("");
    setContactEmail("");
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        contactEmail: contactEmail.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Production Partner</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Partner Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="e.g. Midwest Print Co."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contact Email (optional)</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="ops@partner.com"
            />
          </div>

          <div className="text-xs text-gray-500">
            An API key will be automatically generated for this partner.
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                reset();
              }}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-4 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Partner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
