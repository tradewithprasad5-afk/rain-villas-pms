"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ConsentDetailsPage() {
  const { bookingNumber } = useParams();

  const [consent, setConsent] = useState<any>(null);
const [booking, setBooking] = useState<any>(null);
const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsent();
  }, []);

  async function loadConsent() {
    const q = query(
      collection(db, "consents"),
      where("bookingNumber", "==", bookingNumber)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      setConsent(snapshot.docs[0].data());
    }
const bookingQuery = query(
  collection(db, "bookings"),
  where("bookingNumber", "==", bookingNumber)
);

const bookingSnapshot = await getDocs(bookingQuery);

if (!bookingSnapshot.empty) {
  setBooking(bookingSnapshot.docs[0].data());
}
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-10">
        Loading consent...
      </div>
    );
  }

  if (!consent) {
    return (
      <div className="p-10">
        Consent not found.
      </div>
    );
  }
  
  function downloadPDF() {
  const logo = new Image();
  logo.src = "/logo/rain-villa-logo.jpeg";

  logo.onload = () => {
    const doc = new jsPDF();

    // Logo
    doc.addImage(logo, "JPEG", 15, 10, 35, 35);

    // Header
    doc.setFontSize(20);
    doc.text("The Rain Villa", 60, 22);

    doc.setFontSize(14);
    doc.text("Guest Consent Form", 60, 32);

    // Details Table
    autoTable(doc, {
      startY: 60,
      theme: "grid",
      head: [["Field", "Value"]],
      body: [
        ["Booking Number", consent.bookingNumber],
        ["Guest Name", consent.customerName],
        ["Phone", consent.phone],
        ["Email", consent.email],
        ["ID Type", consent.idType],
        ["ID Number", consent.idNumber],
        ["Adults", consent.adults],
        ["Children", consent.children],
         ["Vehicle Number", consent.vehicleNumber],
  ["Emergency Contact", consent.emergencyContact],

  ["House Rules", consent.houseRules ? "Accepted" : "Not Accepted"],
  ["Pool Rules", consent.poolRules ? "Accepted" : "Not Accepted"],
  ["Damage Policy", consent.damageRules ? "Accepted" : "Not Accepted"],
  ["Zero Tolerance", consent.zeroTolerance ? "Accepted" : "Not Accepted"],
  ["Liability Waiver", consent.liabilityWaiver ? "Accepted" : "Not Accepted"],

  ["Signature", consent.signature],
        [
          "Submitted",
          consent.createdAt?.toDate().toLocaleString(),
        ],
      ],
    });

    doc.save(`${consent.bookingNumber}-Consent.pdf`);
  };
}


  return (
    <main className="max-w-5xl mx-auto p-8">

      <div className="flex justify-between items-center mb-8">

  <h1 className="text-3xl font-bold">
    Guest Consent Details
  </h1>

  <button
    onClick={downloadPDF}
    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
  >
    Download PDF
  </button>

</div>

      <div className="bg-white rounded-xl shadow p-8">

        <div className="grid grid-cols-2 gap-6">

          <div>
            <p className="text-gray-500 text-sm">Booking Number</p>
            <p className="font-semibold">{consent.bookingNumber}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Guest Name</p>
            <p className="font-semibold">{consent.customerName}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Phone</p>
            <p>{consent.phone}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p>{consent.email}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">ID Type</p>
            <p>{consent.idType}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">ID Number</p>
            <p>{consent.idNumber}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Submitted On</p>
            <p>
              {consent.createdAt?.toDate?.().toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Consent Status</p>

            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Completed
            </span>
          </div>

        </div>

      </div>
      {booking && (
  <div className="mt-8 bg-blue-50 rounded-xl p-6">
    <h2 className="text-xl font-bold mb-4">
      Booking Details
    </h2>

    <div className="grid grid-cols-2 gap-4">
      <div>
  <p className="text-gray-500">Check In</p>
  <p>{booking.checkIn}</p>
</div>

<div>
  <p className="text-gray-500">Check Out</p>
  <p>{booking.checkOut}</p>
</div>

<div>
  <p className="text-gray-500">Status</p>
  <p>{booking.status}</p>
</div>

<div>
  <p className="text-gray-500">Villa</p>
  <p>{booking.villa}</p>
</div>
    </div>
  </div>
)}

    </main>
  );
}