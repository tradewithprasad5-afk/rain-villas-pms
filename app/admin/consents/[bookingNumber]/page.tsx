 "use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

type Consent = {
  bookingNumber?: string;
  customerName?: string;
  villa?: string;
  phone?: string;
  email?: string;
  adults?: number;
  children?: number;
  vehicleNumber?: string;
  emergencyContact?: string;
  signature?: string;
  houseRules?: boolean;
  poolRules?: boolean;
  damageRules?: boolean;
  zeroTolerance?: boolean;
  liabilityWaiver?: boolean;
  guestDeclaration?: boolean;
  createdAt?: any;
};

function formatTimestamp(value: any) {
  if (!value) return "-";

  try {
    if (typeof value?.toDate === "function") {
      return value.toDate().toLocaleString("en-IN");
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleString("en-IN");
  } catch {
    return "-";
  }
}

function YesNo({ value }: { value?: boolean }) {
  return (
    <span className={value ? "text-green-700 font-semibold" : "text-red-600"}>
      {value ? "Accepted" : "Not accepted"}
    </span>
  );
}

export default function AdminConsentPage() {
  const params = useParams();
  const router = useRouter();

  const bookingNumber = params.bookingNumber as string;

  const [consent, setConsent] = useState<Consent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadConsent() {
      if (!bookingNumber) return;

      try {
        setLoading(true);
        setError("");

        const snapshot = await getDoc(
          doc(db, "consents", bookingNumber)
        );

        if (!snapshot.exists()) {
          setError("Consent form not found.");
          return;
        }

        setConsent(snapshot.data() as Consent);
      } catch (err) {
        console.error("Failed to load consent:", err);
        setError(
          "Unable to load consent. Please make sure you are logged in as admin."
        );
      } finally {
        setLoading(false);
      }
    }

    loadConsent();
  }, [bookingNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white p-8 shadow">
          Loading consent...
        </div>
      </div>
    );
  }

  if (error || !consent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow">
          <h1 className="text-xl font-bold text-red-600">
            Consent Not Available
          </h1>

          <p className="mt-3 text-gray-600">
            {error || "Consent form not found."}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="no-print mt-6 rounded-lg bg-slate-800 px-5 py-2.5 font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .print-page {
            box-shadow: none !important;
            border: none !important;
            max-width: none !important;
            margin: 0 !important;
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>

      <main className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="no-print mx-auto mb-5 flex max-w-5xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border bg-white px-4 py-2.5 font-medium hover:bg-gray-50"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-slate-800 px-5 py-2.5 font-semibold text-white hover:bg-slate-700"
          >
            🖨 Print Consent
          </button>
        </div>

        <article className="print-page mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
          <header className="bg-slate-800 px-8 py-7 text-white">
            <h1 className="text-3xl font-bold">THE RAIN VILLA</h1>
            <p className="mt-2 text-slate-200">
              Guest Check-in Consent & Liability Agreement
            </p>

            <div className="mt-4 text-sm text-slate-300">
              Booking:{" "}
              <span className="font-semibold text-white">
                {consent.bookingNumber || bookingNumber}
              </span>
            </div>
          </header>

          <div className="space-y-8 p-8">
            <section>
              <h2 className="mb-4 rounded-lg bg-slate-800 px-5 py-3 text-lg font-bold text-white">
                Guest Details
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Guest Name</p>
                  <p className="mt-1 font-semibold">
                    {consent.customerName || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Villa</p>
                  <p className="mt-1 font-semibold">
                    {consent.villa || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Mobile Number</p>
                  <p className="mt-1 font-semibold">
                    {consent.phone || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="mt-1 font-semibold">
                    {consent.email || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Adults</p>
                  <p className="mt-1 font-semibold">
                    {consent.adults ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Children</p>
                  <p className="mt-1 font-semibold">
                    {consent.children ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Vehicle Number</p>
                  <p className="mt-1 font-semibold">
                    {consent.vehicleNumber || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="mt-1 font-semibold">
                    {consent.emergencyContact || "-"}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 rounded-lg bg-slate-800 px-5 py-3 text-lg font-bold text-white">
                Consent Confirmation
              </h2>

              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-2 border-b p-4">
                  <span>House Rules</span>
                  <YesNo value={consent.houseRules} />
                </div>

                <div className="grid grid-cols-2 border-b p-4">
                  <span>Swimming Pool Liability Rules</span>
                  <YesNo value={consent.poolRules} />
                </div>

                <div className="grid grid-cols-2 border-b p-4">
                  <span>Financial Liability Policy</span>
                  <YesNo value={consent.damageRules} />
                </div>

                <div className="grid grid-cols-2 border-b p-4">
                  <span>Zero Tolerance Policy</span>
                  <YesNo value={consent.zeroTolerance} />
                </div>

                <div className="grid grid-cols-2 border-b p-4">
                  <span>General Liability Waiver</span>
                  <YesNo value={consent.liabilityWaiver} />
                </div>

                <div className="grid grid-cols-2 p-4">
                  <span>Guest Declaration</span>
                  <YesNo value={consent.guestDeclaration} />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-300 bg-slate-50 p-6">
              <h2 className="text-lg font-bold text-slate-800">
                Digital Signature
              </h2>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Guest Full Name
                  </p>

                  <p className="mt-2 text-xl font-semibold">
                    {consent.signature || consent.customerName || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Submitted On
                  </p>

                  <p className="mt-2 font-semibold">
                    {formatTimestamp(consent.createdAt)}
                  </p>
                </div>
              </div>

              <p className="mt-6 text-sm leading-6 text-gray-600">
                The guest confirmed the terms and submitted this electronic
                consent and digital signature.
              </p>
            </section>

            <footer className="border-t pt-6 text-sm text-gray-500">
              <p>
                The Rain Villa — Guest Consent Record
              </p>
              <p className="mt-1">
                Booking: {consent.bookingNumber || bookingNumber}
              </p>
            </footer>
          </div>
        </article>
      </main>
    </>
  );
}
