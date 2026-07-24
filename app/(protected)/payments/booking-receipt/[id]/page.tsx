"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { db } from "../../../../lib/firebase";
import "./print.css";

interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  phone?: string;
  villa: string;
  checkIn?: string;
  checkOut?: string;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
}

interface Customer {
  phone?: string;
}

export default function BookingReceiptPage() {
  const { id } = useParams();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [phone, setPhone] = useState("");

  async function loadBooking() {
    const bookingSnap = await getDoc(
      doc(db, "bookings", id as string)
    );

    if (!bookingSnap.exists()) return;

    const bookingData = bookingSnap.data() as Booking;

    setBooking(bookingData);

    if (bookingData.customerId) {
      const customerSnap = await getDoc(
        doc(db, "customers", bookingData.customerId)
      );

      if (customerSnap.exists()) {
        const customer =
          customerSnap.data() as Customer;

        setPhone(customer.phone || "");
      }
    }
  }

  useEffect(() => {
    if (id) loadBooking();
  }, [id]);

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">

      <div className="mx-auto w-full max-w-6xl">

        <div className="flex justify-end mb-5 print:hidden">

          <button
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white shadow hover:bg-blue-700"
          >
            🖨 Print Receipt
          </button>

        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl print:shadow-none">

          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-4 sm:px-6 lg:px-10 py-6 sm:py-8">

<div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">

              <div className="rounded-2xl bg-white p-3 shadow-lg">

                <Image
  src="/logo/rain-villa-logo.jpeg"
  alt="Rain Villas"
  width={150}
  height={150}
  priority
  className="h-20 w-20 sm:h-28 sm:w-28 lg:h-[150px] lg:w-[150px] object-contain"
/>

              </div>

              <div className="text-white">

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide">
                  Rain Villa
                </h1>

                <p className="mt-2 text-base sm:text-lg lg:text-xl font-medium">
                  BOOKING RECEIPT
                </p>

                <p className="mt-3 text-blue-100">
                  📍 Igatpuri, Nashik, Maharashtra
                </p>

                <p className="text-blue-100">
                  Generated on{" "}
                  {new Date().toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>

              </div>

            </div>

          </div>

          {!booking ? (

            <div className="p-20 text-center text-xl">
              Loading...
            </div>

          ) : (

            <div className="p-4 sm:p-6 lg:p-10">

              <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-8">

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <h2 className="text-2xl font-bold text-slate-800">
                    Booking Details
                  </h2>

                  {booking.balanceAmount === 0 ? (

                    <span className="rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
                      ✔ PAID
                    </span>

                  ) : (

                    <span className="rounded-full bg-yellow-100 px-5 py-2 text-sm font-semibold text-yellow-700">
                      PARTIALLY PAID
                    </span>

                  )}

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-x-16 sm:gap-y-8">
                  <div>

                    <p className="text-sm text-slate-500">
                      Booking Number
                    </p>

                    <p className="mt-1 break-words text-lg font-semibold">
                      {booking.bookingNumber}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Guest Name
                    </p>

                    <p className="mt-1 break-words text-lg font-semibold">
                      {booking.customerName}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Mobile Number
                    </p>

                    <p className="mt-1 break-words text-lg font-semibold">
                      {phone || "-"}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Villa
                    </p>

                    <p className="mt-1 break-words text-lg font-semibold">
                      {booking.villa}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Check-in
                    </p>

                    <p className="mt-1 break-words text-lg font-semibold">
                      {formatDate(booking.checkIn)}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Check-out
                    </p>

                    <p className="mt-1 break-words text-lg font-semibold">
                      {formatDate(booking.checkOut)}
                    </p>

                  </div>

                </div>

              </div>

              {/* Finance Cards Start */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* Booking Amount */}

                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 sm:p-8 shadow-md">

                  <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-blue-600 text-2xl sm:text-3xl text-white">
                    🏡
                  </div>

                  <p className="text-xs sm:text-sm uppercase tracking-wide text-slate-500">
                    Total Booking Amount
                  </p>

                  <h3 className="mt-3 break-words text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700">
                    ₹{booking.totalAmount.toLocaleString("en-IN")}
                  </h3>

                </div>

                {/* Amount Paid */}

                <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-5 sm:p-8 shadow-md">

                  <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-green-600 text-2xl sm:text-3xl text-white">
                    💳
                  </div>

                  <p className="text-xs sm:text-sm uppercase tracking-wide text-slate-500">
                    Amount Paid
                  </p>

                  <h3 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700">
                    ₹{booking.advancePaid.toLocaleString("en-IN")}
                  </h3>

                </div>

                {/* Balance */}

                <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100 p-5 sm:p-8 shadow-md">

                  <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-red-600 text-2xl sm:text-3xl text-white">
                    ₹
                  </div>

                  <p className="text-xs sm:text-sm uppercase tracking-wide text-slate-500">
                    Outstanding Balance
                  </p>

                  <h3 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-red-700">
                    ₹{booking.balanceAmount.toLocaleString("en-IN")}
                  </h3>

                </div>

              </div>

              {/* Divider */}

              <div className="my-12 flex items-center">

                <div className="h-px flex-1 bg-slate-300"></div>

                <div className="mx-2 sm:mx-6 rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                  THANK YOU
                </div>

                <div className="h-px flex-1 bg-slate-300"></div>

              </div>

              {/* Thank You */}

              <div className="rounded-3xl bg-gradient-to-r from-green-50 via-white to-green-50 p-5 sm:p-8 lg:p-10">

                <div className="text-center">

                  <div className="mb-4 text-4xl sm:text-5xl lg:text-6xl">
                    🌿
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
                    Thank You for Choosing Rain Villa
                  </h2>

                  <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg leading-7 sm:leading-9 text-slate-600">

                    We sincerely appreciate your reservation and
                    thank you for choosing Rain Villa for your stay.

                    <br />
                    <br />

                    We look forward to welcoming you and hope you
                    enjoy a peaceful, memorable and relaxing
                    experience surrounded by nature.

                  </p>

                </div>

              </div>

              {/* Footer Starts */}
                            <div className="mt-12 border-t border-slate-200 pt-10">

                <h3 className="mb-10 text-center text-3xl font-bold text-blue-700">
                  Rain Villa
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                  {/* Phone */}

                  <div className="rounded-2xl bg-slate-50 p-5 sm:p-6 text-center shadow-sm">

                    <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-600 text-3xl text-white">
                      📞
                    </div>

                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                      Contact
                    </p>

                    <p className="text-base sm:text-lg font-semibold text-slate-800">
                      9527249988
                    </p>

                    <p className="text-base sm:text-lg font-semibold text-slate-800">
                      9923506006
                    </p>

                  </div>

                  {/* Email */}

                  <div className="rounded-2xl bg-slate-50 p-5 sm:p-6 text-center shadow-sm">

                    <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-600 text-3xl text-white">
                      ✉️
                    </div>

                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </p>

                    <p className="break-words text-base sm:text-lg font-medium text-slate-800">
                      rainvilla.igatpuri@gmail.com
                    </p>

                  </div>

                  {/* Website */}

                  <div className="rounded-2xl bg-slate-50 p-5 sm:p-6 text-center shadow-sm">

                    <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-purple-600 text-3xl text-white">
                      🌐
                    </div>

                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                      Website
                    </p>

                    <a
                      href="https://rainvilla.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base sm:text-lg font-semibold text-blue-600 hover:underline"
                    >
                      www.rainvilla.in
                    </a>

                  </div>

                </div>

                <div className="mt-12 rounded-2xl bg-blue-50 p-5 sm:p-6">

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">

                    <div>

                      <h4 className="text-xl font-bold text-blue-800">
                        We look forward to welcoming you!
                      </h4>

                      <p className="mt-2 text-slate-600">
                        Thank you for trusting Rain Villa for your stay.
                      </p>

                    </div>

                    <div className="text-5xl sm:text-6xl">
                      🏡
                    </div>

                  </div>

                </div>

                <div className="mt-10 text-center text-sm text-slate-500">

                  This is a computer generated booking receipt and does not require a signature.

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
      );
}