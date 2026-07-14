"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Payment {
    customerId?: string;
  receiptNumber?: string;
  bookingNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  notes?: string;
  createdAt?: any;
}

export default function ReceiptPage() {
  const { id } = useParams();

  const [payment, setPayment] = useState<Payment | null>(null);
  

  async function loadPayment() {
  const paymentSnap = await getDoc(
    doc(db, "payments", id as string)
  );

  if (!paymentSnap.exists()) return;

  setPayment(paymentSnap.data() as Payment);
}
  useEffect(() => {
  if (id) {
    loadPayment();
  }
}, [id]);

  if (!payment) {
    return (
      <div className="p-10">
        Loading receipt...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white flex justify-center p-10 print:p-0">

      <div className="bg-white shadow print:shadow-none rounded-xl print:rounded-none w-full max-w-2xl p-10">

        <h1 className="text-3xl font-bold text-center">
          Rain Villas
        </h1>

        <p className="text-center text-gray-500 mb-8">
          PAYMENT RECEIPT
        </p>

        <div className="space-y-3">

          <p>
            <strong>Receipt No:</strong>{" "}
            {payment.receiptNumber}
          </p>

          <p>
            <strong>Booking No:</strong>{" "}
            {payment.bookingNumber}
          </p>

          <p>
            <strong>Guest:</strong>{" "}
            {payment.customerName}
          </p>

          <p>
            <strong>Payment Type:</strong>{" "}
            {payment.paymentType}
          </p>

          <p>
            <strong>Payment Method:</strong>{" "}
            {payment.paymentMethod}
          </p>

          <p>
            <strong>Amount:</strong> ₹
            {payment.amount}
          </p>

          <p>
            <strong>Notes:</strong>{" "}
            {payment.notes || "-"}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {payment.createdAt?.toDate?.().toLocaleDateString()}
          </p>
          <div className="mt-10 flex justify-center print:hidden">
  <button
    onClick={() => window.print()}
    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
  >
    🖨 Print Receipt
  </button>
</div>

        </div>

      </div>

    </div>
  );
}