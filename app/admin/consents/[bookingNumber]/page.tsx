"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import jsPDF from "jspdf";

type Consent = {
  bookingNumber?: string;
  bookingNumbers?: string[];
  bookingGroupId?: string;
  consentId?: string;
  customerName?: string;
  villa?: string;
  villas?: string[];
  checkIn?: string;
  checkOut?: string;
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

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9-_]/gi, "-");
}

export default function AdminConsentPage() {
  const params = useParams();
  const router = useRouter();

  const bookingNumber = params.bookingNumber as string;

  const [consent, setConsent] = useState<Consent | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState("");

  function normalizePhone(value?: string) {
    const digits = (value || "").replace(/\D/g, "");
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  function normalizeDate(value?: string) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString().slice(0, 10);
  }

  function getConsentId(
    primaryBooking: any,
    sourceBookings: any[] = []
  ) {
    // IMPORTANT:
    // Always reuse the consentId already stored on a booking first.
    // The guest consent page saves this stable ID after submission.
    // Never rebuild the ID from phone number because the guest can edit
    // their phone number during consent submission.
    const existingConsentId =
      sourceBookings.find((item) => item?.consentId)?.consentId ||
      primaryBooking?.consentId ||
      "";

    if (existingConsentId) {
      return existingConsentId;
    }

    // For new stays, use the booking number(s) so the ID remains stable.
    // Both Villas can therefore share one consent document.
    const bookingNumbers = Array.from(
      new Set(
        sourceBookings
          .map((item) => item?.bookingNumber)
          .filter(Boolean)
      )
    ).sort();

    if (bookingNumbers.length) {
      return `stay-${bookingNumbers.join("-")}`;
    }

    if (primaryBooking?.bookingGroupId) {
      return `stay-group-${primaryBooking.bookingGroupId}`;
    }

    if (primaryBooking?.customerId) {
      return `stay-customer-${primaryBooking.customerId}-${normalizeDate(primaryBooking.checkIn)}-${normalizeDate(primaryBooking.checkOut)}`;
    }

    return `legacy-booking-${primaryBooking?.bookingNumber || "unknown"}`;
  }

  useEffect(() => {
    async function loadConsent() {
      if (!bookingNumber) return;

      try {
        setLoading(true);
        setError("");

        const bookingSnapshot = await getDocs(collection(db, "bookings"));
        const bookingDocs = bookingSnapshot.docs.map((bookingDoc) => ({
          id: bookingDoc.id,
          ...bookingDoc.data(),
        })) as any[];

        const primaryBooking = bookingDocs.find(
          (booking) => booking.bookingNumber === bookingNumber
        );

        if (!primaryBooking) {
          setError("Booking not found.");
          return;
        }

        const primaryPhone = normalizePhone(primaryBooking.phone || "");

        const sourceBookings = bookingDocs.filter((booking) => {
          const sameDates =
            normalizeDate(booking.checkIn) === normalizeDate(primaryBooking.checkIn) &&
            normalizeDate(booking.checkOut) === normalizeDate(primaryBooking.checkOut);

          const bookingPhone = normalizePhone(booking.phone || "");

          if (primaryPhone) {
            return sameDates && bookingPhone === primaryPhone;
          }

          return sameDates && booking.customerId === primaryBooking.customerId;
        });

        // First use the consentId already stored on any source booking.
        // This is the ID written by the current guest consent submission flow.
        const storedConsentId =
          sourceBookings.find((booking) => booking?.consentId)?.consentId ||
          primaryBooking.consentId ||
          "";

        const consentId =
          storedConsentId ||
          getConsentId(primaryBooking, sourceBookings);

        let consentSnapshot = await getDoc(
          doc(db, "consents", consentId)
        );

        // Compatibility with consents created by the previous grouped-booking version.
        if (!consentSnapshot.exists() && primaryBooking.bookingGroupId) {
          consentSnapshot = await getDoc(
            doc(db, "consents", `group-${primaryBooking.bookingGroupId}`)
          );
        }

        // Legacy compatibility: old records used the booking number as the
        // consent document ID.
        if (!consentSnapshot.exists()) {
          for (const sourceBooking of sourceBookings) {
            if (!sourceBooking.bookingNumber) continue;

            const legacySnapshot = await getDoc(
              doc(db, "consents", sourceBooking.bookingNumber)
            );

            if (legacySnapshot.exists()) {
              consentSnapshot = legacySnapshot;
              break;
            }
          }
        }

        if (!consentSnapshot.exists()) {
          setError("Consent form not found.");
          return;
        }

        const data = consentSnapshot.data() as Consent;
        setConsent({
          ...data,
          consentId: data.consentId || consentId,
          bookingGroupId: primaryBooking.bookingGroupId || data.bookingGroupId,
          bookingNumber: data.bookingNumber || primaryBooking.bookingNumber,
          bookingNumbers: Array.from(
            new Set(
              sourceBookings
                .map((booking) => booking.bookingNumber)
                .filter(Boolean)
            )
          ),
          villas: Array.from(
            new Set(
              sourceBookings
                .map((booking) => booking.villa)
                .filter(Boolean)
            )
          ),
          villa: Array.from(
            new Set(
              sourceBookings
                .map((booking) => booking.villa)
                .filter(Boolean)
            )
          ).join(" + ") || data.villa,
          checkIn: primaryBooking.checkIn || data.checkIn,
          checkOut: primaryBooking.checkOut || data.checkOut,
          phone: data.phone || primaryBooking.phone,
          customerName: data.customerName || primaryBooking.customerName,
        });
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

  async function handlePrintConsent() {
    if (!consent || printing) return;

    setPrinting(true);

    try {
      if (!Capacitor.isNativePlatform()) {
        window.print();
        return;
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      let y = margin;

      const ensureSpace = (height: number) => {
        if (y + height > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      const addSectionTitle = (title: string) => {
        ensureSpace(14);

        pdf.setFillColor(31, 43, 61);
        pdf.roundedRect(
          margin,
          y,
          contentWidth,
          10,
          2,
          2,
          "F"
        );

        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text(title, margin + 5, y + 6.7);

        pdf.setTextColor(0, 0, 0);
        y += 16;
      };

      const addField = (
        label: string,
        value: string,
        x: number,
        width: number
      ) => {
        ensureSpace(15);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 100, 100);
        pdf.text(label, x, y);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);
        pdf.setTextColor(25, 25, 25);

        const lines = pdf.splitTextToSize(value || "-", width);
        pdf.text(lines, x, y + 5);

        return Math.max(12, lines.length * 5 + 5);
      };

      const addConsentRow = (
        label: string,
        accepted: boolean | undefined
      ) => {
        ensureSpace(9);

        pdf.setDrawColor(220, 220, 220);
        pdf.line(
          margin,
          y - 4,
          pageWidth - margin,
          y - 4
        );

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5);
        pdf.setTextColor(35, 35, 35);
        pdf.text(label, margin + 3, y + 1);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.5);

        if (accepted) {
          pdf.setTextColor(22, 120, 70);
          pdf.text(
            "Accepted",
            pageWidth - margin - 32,
            y + 1
          );
        } else {
          pdf.setTextColor(190, 55, 55);
          pdf.text(
            "Not accepted",
            pageWidth - margin - 32,
            y + 1
          );
        }

        y += 8;
      };

      // Header
      pdf.setFillColor(31, 43, 61);
      pdf.rect(0, 0, pageWidth, 40, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text("THE RAIN VILLA", margin, 16);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.text(
        "Guest Check-in Consent & Liability Agreement",
        margin,
        24
      );

      pdf.setFontSize(10);
      pdf.text(
        `Booking: ${(consent.bookingNumbers || [consent.bookingNumber || bookingNumber]).join(" + ")}`,
        margin,
        32
      );

      pdf.setTextColor(0, 0, 0);
      y = 50;

      // Guest details
      addSectionTitle("GUEST DETAILS");

      const columnWidth = (contentWidth - 10) / 2;
      const leftX = margin;
      const rightX = margin + columnWidth + 10;

      let leftHeight = addField(
        "Guest Name",
        consent.customerName || "-",
        leftX,
        columnWidth
      );

      let rightHeight = addField(
        "Villa",
        (consent.villas || [consent.villa || "-"]).join(" + "),
        rightX,
        columnWidth
      );

      y += Math.max(leftHeight, rightHeight);

      leftHeight = addField(
        "Mobile Number",
        consent.phone || "-",
        leftX,
        columnWidth
      );

      rightHeight = addField(
        "Email",
        consent.email || "-",
        rightX,
        columnWidth
      );

      y += Math.max(leftHeight, rightHeight);

      leftHeight = addField(
        "Adults",
        String(consent.adults ?? "-"),
        leftX,
        columnWidth
      );

      rightHeight = addField(
        "Children",
        String(consent.children ?? "-"),
        rightX,
        columnWidth
      );

      y += Math.max(leftHeight, rightHeight);

      leftHeight = addField(
        "Check-In",
        consent.checkIn || "-",
        leftX,
        columnWidth
      );

      rightHeight = addField(
        "Check-Out",
        consent.checkOut || "-",
        rightX,
        columnWidth
      );

      y += Math.max(leftHeight, rightHeight);

      leftHeight = addField(
        "Vehicle Number",
        consent.vehicleNumber || "-",
        leftX,
        columnWidth
      );

      rightHeight = addField(
        "Emergency Contact",
        consent.emergencyContact || "-",
        rightX,
        columnWidth
      );

      y += Math.max(leftHeight, rightHeight);

      // Consent confirmation
      addSectionTitle("CONSENT CONFIRMATION");

      addConsentRow("House Rules", consent.houseRules);
      addConsentRow(
        "Swimming Pool Liability Rules",
        consent.poolRules
      );
      addConsentRow(
        "Financial Liability Policy",
        consent.damageRules
      );
      addConsentRow(
        "Zero Tolerance Policy",
        consent.zeroTolerance
      );
      addConsentRow(
        "General Liability Waiver",
        consent.liabilityWaiver
      );
      addConsentRow(
        "Guest Declaration",
        consent.guestDeclaration
      );

      y += 8;

      // Digital signature
      ensureSpace(40);

      pdf.setFillColor(245, 248, 250);
      pdf.setDrawColor(210, 215, 220);
      pdf.roundedRect(
        margin,
        y,
        contentWidth,
        31,
        2,
        2,
        "FD"
      );

      pdf.setTextColor(35, 35, 35);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("DIGITAL SIGNATURE", margin + 5, y + 7);

      pdf.setFontSize(14);
      pdf.text(
        consent.signature || consent.customerName || "-",
        margin + 5,
        y + 16
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(90, 90, 90);
      pdf.text(
        `Submitted: ${formatTimestamp(consent.createdAt)}`,
        margin + 5,
        y + 25
      );

      y += 40;

      // Footer
      ensureSpace(25);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(90, 90, 90);

      const footerText =
        "The guest confirmed the terms and submitted this electronic consent and digital signature.";

      const footerLines = pdf.splitTextToSize(
        footerText,
        contentWidth
      );

      pdf.text(footerLines, margin, y);
      y += footerLines.length * 4 + 7;

      pdf.setDrawColor(200, 200, 200);
      pdf.line(
        margin,
        y,
        pageWidth - margin,
        y
      );

      pdf.text(
        "The Rain Villa — Guest Consent Record",
        margin,
        y + 5
      );

      pdf.text(
        `Booking: ${(consent.bookingNumbers || [consent.bookingNumber || bookingNumber]).join(" + ")}`,
        pageWidth - margin,
        y + 5,
        { align: "right" }
      );

      // Page numbers
      const totalPages = pdf.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        pdf.setPage(page);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(
          `Page ${page} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 6,
          { align: "center" }
        );
      }

      // Convert to base64 and save to Android cache.
      const pdfBase64 = pdf
        .output("datauristring")
        .split(",")[1];

      const fileName =
        `Rain-Villa-Consent-${safeFileName(
          consent.bookingNumber || bookingNumber
        )}.pdf`;

      const file = await Filesystem.writeFile({
        path: fileName,
        data: pdfBase64,
        directory: Directory.Cache,
        recursive: true,
      });

      // Open Android share / print chooser.
      await Share.share({
        title: `Rain Villa Consent - ${
          consent.bookingNumber || bookingNumber
        }`,
        text: `Guest Consent Form - ${
          consent.bookingNumber || bookingNumber
        }`,
        url: file.uri,
        dialogTitle: "Print or Share Consent PDF",
      });
    } catch (err) {
      console.error("PDF print error:", err);
      alert("Unable to create the PDF. Please try again.");
    } finally {
      setPrinting(false);
    }
  }

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
            className="mt-6 rounded-lg bg-slate-800 px-5 py-2.5 font-semibold text-white"
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
            onClick={handlePrintConsent}
            disabled={printing}
            className="rounded-lg bg-slate-800 px-5 py-2.5 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {printing ? "Creating PDF..." : "🖨 Print Consent"}
          </button>
        </div>

        <article className="print-page mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
          <header className="bg-slate-800 px-8 py-7 text-white">
            <h1 className="text-3xl font-bold">THE RAIN VILLA</h1>
            <p className="mt-2 text-slate-200">
              Guest Check-in Consent & Liability Agreement
            </p>

            <div className="mt-4 text-sm text-slate-300">
              Booking: {" "}
              <span className="font-semibold text-white">
                {(consent.bookingNumbers || [consent.bookingNumber || bookingNumber]).join(" + ")}
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
                    {(consent.villas || [consent.villa || "-"]).join(" + ")}
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
                {[
                  ["House Rules", consent.houseRules],
                  [
                    "Swimming Pool Liability Rules",
                    consent.poolRules,
                  ],
                  [
                    "Financial Liability Policy",
                    consent.damageRules,
                  ],
                  [
                    "Zero Tolerance Policy",
                    consent.zeroTolerance,
                  ],
                  [
                    "General Liability Waiver",
                    consent.liabilityWaiver,
                  ],
                  [
                    "Guest Declaration",
                    consent.guestDeclaration,
                  ],
                ].map(([label, value], index) => (
                  <div
                    key={String(label)}
                    className={`grid grid-cols-2 p-4 ${
                      index !== 5 ? "border-b" : ""
                    }`}
                  >
                    <span>{String(label)}</span>
                    <span
                      className={
                        value
                          ? "font-semibold text-green-700"
                          : "text-red-600"
                      }
                    >
                      {value ? "Accepted" : "Not accepted"}
                    </span>
                  </div>
                ))}
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
              <p>The Rain Villa — Guest Consent Record</p>
              <p className="mt-1">
                Booking: {(consent.bookingNumbers || [consent.bookingNumber || bookingNumber]).join(" + ")}
              </p>
            </footer>
          </div>
        </article>
      </main>
    </>
  );
}
