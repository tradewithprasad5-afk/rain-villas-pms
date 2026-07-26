"use client";

import {
  Globe,
  Copy,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
const portalUrl = "https://rain-villas-pms-2t1k.vercel.app/agent";



export default function AgentPortalPage() {
   const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(portalUrl);
    alert("Agent portal link copied successfully.");
  } catch {
    alert("Unable to copy link.");
  }
};

const openPortal = () => {
  window.open(portalUrl, "_blank");
};

  const shareWhatsApp = () => {
    const message = encodeURIComponent(
      `Check live villa availability:\n${portalUrl}`
    );

    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-4xl">

      <div className="rounded-2xl bg-white p-8 shadow-md">

        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-blue-600" />

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Agent Portal
            </h1>

            <p className="text-slate-500">
              Share the public availability portal with travel agents.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <label className="mb-2 block font-semibold text-slate-700">
            Public Portal Link
          </label>

          <div className="rounded-xl border bg-slate-50 p-4 break-all text-blue-700">
            {portalUrl}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">

          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            <Copy size={18} />
            Copy Link
          </button>

          <button
            onClick={openPortal}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-100"
          >
            <ExternalLink size={18} />
            Open Portal
          </button>

          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-white hover:bg-green-700"
          >
            <MessageCircle size={18} />
            Share via WhatsApp
          </button>

        </div>

      </div>

    </div>
  );
}