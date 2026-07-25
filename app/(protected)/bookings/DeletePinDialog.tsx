"use client";

import { useState } from "react";

interface DeletePinDialogProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => Promise<void>;
}

export default function DeletePinDialog({
  open,
  onClose,
  onVerified,
}: DeletePinDialogProps) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verify-delete-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (data.success) {
        await onVerified();
        setPin("");
        onClose();
      } else {
        setError(data.message || "Incorrect PIN");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">
          🔒 Delete Booking
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Enter the Admin PIN to continue.
        </p>

        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          className="mt-4 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}