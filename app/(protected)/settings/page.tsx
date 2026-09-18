"use client";

import Image from "next/image";

import { downloadBusinessBackup } from "@/app/lib/businessBackup";
import {
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  Copy,
  Landmark,
  QrCode,
} from "lucide-react";


export default function SettingsPage() {
  const upiId = "bom260701342840@mahb";

  function copyUPI() {
    navigator.clipboard.writeText(upiId);
    alert("UPI ID copied successfully.");
  }

  function sharePaymentDetails() {
    const message = `🏡 Rain Villa

Payment Details

🏦 Bank : Bank of Maharashtra

💳 Account Number :
60582272804

🏛 IFSC :
MAHB0000959

📲 UPI ID :
${upiId}

Please complete the payment using the above UPI ID or QR Code.

Thank you,
Rain Villa`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }


  return (
    <div className="settings-page">
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-8">
          <div className="h-14 w-14 rounded-xl settings-logo flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/logo/rain-villa-logo.jpeg"
              alt="Rain Villa Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-semibold text-base settings-heading">
              Rain Villa
              <BadgeCheck className="h-4 w-4 text-blue-600 shrink-0" />
            </p>
            <p className="text-sm truncate settings-muted">
              www.rainvilla.in
            </p>
          </div>
        </div>

        {/* Responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 sm:gap-6 items-start">

          {/* Left column */}
          <div className="flex flex-col gap-5 sm:gap-6">

            {/* Company Information */}
            <div className="settings-card rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 settings-row settings-border-bottom">
                <Mail className="h-[18px] w-[18px] settings-icon shrink-0" />
                <p className="text-sm break-all settings-heading">
                  rainvilla.igatpuri@gmail.com
                </p>
              </div>

              <div className="flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 settings-row settings-border-bottom">
                <Phone className="h-[18px] w-[18px] settings-icon shrink-0" />
                <p className="text-sm settings-heading">
                  9923506006 / 9527249988
                </p>
              </div>

              <div className="flex gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 settings-row">
                <MapPin className="h-[18px] w-[18px] settings-icon shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed settings-heading">
                  Ritiksha Homeland, Plot No. 36, Igatpuri – 422403,
                  Maharashtra, India
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="settings-card rounded-xl overflow-hidden">
              <p className="px-4 pt-4 pb-2 text-sm font-medium settings-heading">
                Payment details
              </p>

              <div className="flex items-center justify-between gap-3 px-4 py-3 settings-border-top settings-border-bottom">
                <div className="flex items-center gap-3 min-w-0">
                  <Landmark className="h-[18px] w-[18px] settings-icon shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs settings-muted">
                      Bank of Maharashtra
                    </p>
                    <p className="text-sm mt-0.5 settings-heading">
                      60582272804
                    </p>
                  </div>
                </div>
                <p className="text-xs settings-muted shrink-0">
                  MAHB0000959
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs settings-muted">
                    UPI ID
                  </p>
                  <p className="text-sm mt-0.5 break-all settings-heading">
                    {upiId}
                  </p>
                </div>

                <button
                  onClick={copyUPI}
                  className="settings-secondary-button shrink-0 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium"
                >
                  <Copy className="h-[14px] w-[14px]" />
                  Copy
                </button>
              </div>

              {/* QR on mobile */}
              <div className="lg:hidden flex flex-col items-center gap-2 px-4 py-4 settings-border-top">
                <div className="h-36 w-36 rounded-lg settings-qr flex items-center justify-center overflow-hidden">
                  <Image
                    src="/payment/upi-qr.jpeg"
                    alt="UPI QR"
                    width={144}
                    height={144}
                    className="h-full w-full object-contain"
                  />
                </div>

                <p className="text-xs settings-muted text-center flex items-center gap-1">
                  <QrCode className="h-3.5 w-3.5" />
                  Scan with any UPI app
                </p>
              </div>
            </div>

            {/* Share button mobile */}
            <button
              onClick={sharePaymentDetails}
              className="settings-accent-button lg:hidden w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold"
            >
              📲 Share payment details
            </button>

            <button
              onClick={downloadBusinessBackup}
              className="w-full flex items-center justify-center gap-2 rounded-lg settings-primary-button py-2.5 text-sm font-semibold"
            >
              📥 Download Business Backup (.xlsx)
            </button>
          </div>

          {/* Right column */}
          <div className="hidden lg:flex flex-col items-center gap-3 settings-card rounded-xl p-6">
            <p className="self-start text-sm font-medium settings-heading">
              Scan to pay
            </p>

            <div className="h-44 w-44 rounded-lg settings-qr flex items-center justify-center overflow-hidden">
              <Image
                src="/payment/upi-qr.jpeg"
                alt="UPI QR"
                width={176}
                height={176}
                className="h-full w-full object-contain"
              />
            </div>

            <p className="text-xs settings-muted text-center flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5" />
              Scan with any UPI app
            </p>

            <button
              onClick={sharePaymentDetails}
              className="settings-accent-button w-full mt-2 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold"
            >
              📲 Share payment details
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="settings-support rounded-xl p-4 sm:p-6 mt-5 sm:mt-6">
          <h3 className="text-base font-semibold settings-support-heading">
            Rain Villa PMS
          </h3>

          <p className="text-sm mt-3 leading-relaxed settings-support-text">
            This Property Management System has been developed
            exclusively for <strong>Rain Villa, Igatpuri</strong>
            to simplify reservations, guest management,
            payments, reports and daily operations.
          </p>

          <div className="mt-4 settings-support-divider pt-3">
            <p className="text-xs settings-support-text">
              <strong>Support:</strong> Please contact the
              Rain Villa PMS administrator for technical
              assistance, maintenance or future enhancements.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
