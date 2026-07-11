"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useEffect, useState } from "react";


interface Payment {
    
  id: string;
  receiptNumber?: string;
  bookingNumber: string;
  customerName: string;
  phone?: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
   notes?: string;
  createdAt?: any;
}

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
export default function PaymentsPage() {
    
    const [payments, setPayments] = useState<Payment[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
const [loading, setLoading] = useState(true);
const [showForm, setShowForm] = useState(false);
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");

const [bookingNumber, setBookingNumber] = useState("");
const [customerName, setCustomerName] = useState("");

const [amount, setAmount] = useState("");
const [paymentMethod, setPaymentMethod] = useState("Cash");
const [paymentType, setPaymentType] = useState("Advance");
const [notes, setNotes] = useState("");
const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
const [bookingParam, setBookingParam] = useState("");
const [totalAmount, setTotalAmount] = useState(0);
const [advancePaid, setAdvancePaid] = useState(0);
const [balanceAmount, setBalanceAmount] = useState(0);
const totalRevenue = bookings.reduce(
  (sum, booking) => sum + booking.totalAmount,
  0
);

const totalReceived = bookings.reduce(
  (sum, booking) => sum + booking.advancePaid,
  0
);

const totalOutstanding = bookings.reduce(
  (sum, booking) => sum + booking.balanceAmount,
  0
);
async function loadPayments() {
  const snapshot = await getDocs(collection(db, "payments"));

  let data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Payment[];

  if (bookingParam) {
  data = data.filter(
    (payment) => payment.bookingNumber === bookingParam
  );
}

  setPayments(data);
  setLoading(false);
}
async function loadBookings() {
    console.log("loadBookings called");
  try {
    const snapshot = await getDocs(collection(db, "bookings"));

    const data = await Promise.all(
      snapshot.docs.map(async (bookingDoc) => {
        const booking = {
          id: bookingDoc.id,
          ...bookingDoc.data(),
        } as Booking;

        if (booking.customerId) {
          const customerSnap = await getDoc(
            doc(db, "customers", booking.customerId)
          );

          if (customerSnap.exists()) {
            const customer = customerSnap.data() as Customer;
            booking.phone = customer.phone;
          }
        }

        return booking;
      })
    );

    console.log("Bookings found:", data.length);

    setBookings(data);

    if (bookingParam) {
      const booking = data.find(
        (b) => b.bookingNumber === bookingParam
      );

      if (booking) {
        setSelectedBooking(booking);

        setBookingNumber(booking.bookingNumber);
        setCustomerName(booking.customerName);

        setTotalAmount(booking.totalAmount);
        setAdvancePaid(booking.advancePaid);
        setBalanceAmount(booking.balanceAmount);

        setPaymentType("Balance");
        setAmount(String(booking.balanceAmount));

        setShowForm(true);
      }
    }
  } catch (err) {
    console.error("Error loading bookings:", err);
  } finally {
    setLoading(false);
  }
}
async function savePayment() {
  if (!bookingNumber) {
    alert("Please select a booking.");
    return;
  }

  if (!amount) {
    alert("Please enter an amount.");
    return;
  }
    const paymentValue = Number(amount);

if (paymentValue <= 0) {
  alert("Payment amount must be greater than zero.");
  return;
}
if (
  selectedBooking &&
  paymentType !== "Extra Charge" &&
  paymentType !== "Refund" &&
  paymentValue > selectedBooking.balanceAmount
) {
  alert("Amount cannot exceed balance due.");
  return;
}
const receiptNumber = `RCPT-${Date.now()}`;

await addDoc(collection(db, "payments"), {
  receiptNumber,
  bookingNumber,
  customerName,
  amount: paymentValue,
  paymentMethod,
  paymentType,
  notes,
  createdAt: serverTimestamp(),
});

    
  if (selectedBooking) {
  

  let newTotalAmount = Number(selectedBooking.totalAmount || 0);
let newAdvancePaid = Number(selectedBooking.advancePaid || 0);

switch (paymentType) {
  case "Advance":
    newAdvancePaid += paymentValue;
    break;

  case "Balance":
    newAdvancePaid += paymentValue;
    break;

  case "Extra Charge":
    newTotalAmount += paymentValue;
    break;

  case "Refund":
    if (paymentValue > newAdvancePaid) {
      alert("Refund amount cannot exceed amount paid.");
      return;
    }

    newAdvancePaid -= paymentValue;
    break;
}

const newBalanceAmount =
  newTotalAmount - newAdvancePaid;

  await updateDoc(doc(db, "bookings", selectedBooking.id), {
    totalAmount: newTotalAmount,
    advancePaid: newAdvancePaid,
    balanceAmount: newBalanceAmount,
  });
}

  alert("Payment saved successfully.");

  setShowForm(false);

  setBookingNumber("");
  setCustomerName("");
  setAmount("");
  setPaymentMethod("Cash");
  setPaymentType("Advance");
  setNotes("");
  setSelectedBooking(null);
setTotalAmount(0);
setAdvancePaid(0);
setBalanceAmount(0);
await loadBookings();
await loadPayments();
}
useEffect(() => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  setBookingParam(params.get("booking") || "");
}, []);
useEffect(() => {
    console.log("Payments useEffect", bookingParam);
  loadBookings();
  loadPayments();
}, [bookingParam]);

const filteredBookings = bookings
  .filter((booking) => {
    const matchesSearch =
      booking.bookingNumber
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      booking.customerName
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Paid" && booking.balanceAmount === 0) ||
      (statusFilter === "Partial" && booking.balanceAmount > 0);

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    if (!a.checkIn) return 1;
    if (!b.checkIn) return -1;

    return (
      new Date(a.checkIn).getTime() -
      new Date(b.checkIn).getTime()
    );
  });
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">
          <div className="mb-8">
  <h1 className="text-3xl font-bold">
    Payments
  </h1>

  <p className="text-gray-500 mt-1">
    Receive and manage booking payments.
  </p>
</div>
          <div className="grid grid-cols-4 gap-4 mb-6">

  <div className="bg-white rounded-xl shadow p-5">
    <p className="text-gray-500 text-sm">Total Revenue</p>
    <p className="text-2xl font-bold">
      ₹{totalRevenue.toLocaleString()}
    </p>
  </div>

  <div className="bg-white rounded-xl shadow p-5">
    <p className="text-gray-500 text-sm">Total Received</p>
    <p className="text-2xl font-bold text-green-600">
      ₹{totalReceived.toLocaleString()}
    </p>
  </div>

  <div className="bg-white rounded-xl shadow p-5">
    <p className="text-gray-500 text-sm">Outstanding</p>
    <p className="text-2xl font-bold text-red-600">
      ₹{totalOutstanding.toLocaleString()}
    </p>
  </div>

  <div className="bg-white rounded-xl shadow p-5">
  <p className="text-gray-500 text-sm">Total Bookings</p>
  <p className="text-2xl font-bold text-blue-600">
    {bookings.length}
  </p>
</div>

</div> {/* End of Summary Cards */}

<div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-4">

  <input
    type="text"
    placeholder="🔍 Search by Booking Number or Guest Name..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="flex-1 border rounded-lg px-4 py-3"
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border rounded-lg px-4 py-3"
  >
    <option value="All">All</option>
    <option value="Paid">Paid</option>
    <option value="Partial">Partial</option>
  </select>

</div>

 
          <div className="bg-white rounded-xl shadow overflow-hidden">

  <table className="w-full">

    <thead className="bg-gray-100">
  <tr>
    <th className="text-left p-4">Booking</th>
    <th className="text-left p-4">Guest</th>
    <th className="text-left p-4">Villa</th>
    <th className="text-left p-4">Stay</th>
    <th className="text-right p-4">Total</th>
    <th className="text-right p-4">Paid</th>
    <th className="text-right p-4">Balance</th>
    <th className="text-center p-4">Status</th>
    <th className="text-center p-4">Action</th>
  </tr>
</thead>

    <tbody>

      {loading ? (

        <tr>
  <td colSpan={9} className="text-center p-8">
    Loading bookings...
  </td>
</tr>

      ) : filteredBookings.length === 0 ? (

        <tr>
          <td colSpan={9} className="text-center p-8 text-gray-500">
            No bookings found.
          </td>
        </tr>

      ) : (

        filteredBookings.map((booking) => (

          <tr key={booking.id} className="border-t hover:bg-gray-50">

  <td className="p-4 font-medium">
    {booking.bookingNumber}
  </td>

  <td className="p-4">

  <div className="font-medium">
    {booking.customerName}
  </div>

  <div className="text-sm text-gray-500">
    📞 {booking.phone || "-"}
  </div>

</td>

  <td className="p-4 font-medium">
  {booking.villa}
</td>
<td className="p-4 whitespace-nowrap">
  {booking.checkIn
    ? new Date(booking.checkIn).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
    : "-"}
  {" → "}
  {booking.checkOut
    ? new Date(booking.checkOut).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
    : "-"}
</td>

  <td className="p-4 text-right font-semibold">
    ₹{booking.totalAmount}
  </td>

  <td className="p-4 text-right text-green-600 font-semibold">
    ₹{booking.advancePaid}
  </td>

  <td className="p-4 text-right text-red-600 font-semibold">
    ₹{booking.balanceAmount}
  </td>

  <td className="p-4 text-center">

  {booking.balanceAmount === 0 ? (
    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
      🟢 Paid
    </span>
  ) : booking.advancePaid === 0 ? (
    <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm">
      🔴 Unpaid
    </span>
  ) : (
    <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm">
      🟡 Partial
    </span>
  )}

</td>

  <td className="p-4 text-center">

  <div className="flex justify-center gap-2">

    <button
      onClick={() =>
        window.open(
          `/payments/booking-receipt/${booking.id}`,
          "_blank"
        )
      }
      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
    >
      📄 Receipt
    </button>

    {booking.balanceAmount > 0 && (
      <button
        onClick={() => {
          setSelectedBooking(booking);

          setBookingNumber(booking.bookingNumber);
          setCustomerName(booking.customerName);

          setTotalAmount(booking.totalAmount);
          setAdvancePaid(booking.advancePaid);
          setBalanceAmount(booking.balanceAmount);

          setPaymentType("Balance");
          setAmount(String(booking.balanceAmount));

          setShowForm(true);
        }}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
      >
        💰 Receive
      </button>
    )}

  </div>

</td>

</tr>

        ))

      )}

    </tbody>

  </table>

</div>
        {showForm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        Receive Payment
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="block mb-2">Booking Number</label>

          <select
  value={bookingNumber}
  onChange={(e) => {
     const selected = bookings.find(
    (b) => b.bookingNumber === e.target.value
  );

  if (!selected) return;

  setSelectedBooking(selected);

  setBookingNumber(selected.bookingNumber);
  setCustomerName(selected.customerName);

  setTotalAmount(selected.totalAmount);
  setAdvancePaid(selected.advancePaid);
  setBalanceAmount(selected.balanceAmount);

  // Default payment amount = Balance Due
  // Default payment amount based on payment type
if (paymentType === "Balance") {
  setAmount(String(selected.balanceAmount));
} else {
  setAmount("");
}
  }}
  className="w-full border rounded-lg p-3"
>
 <option value="">Select Booking</option>

{filteredBookings
  .filter((booking) => booking.balanceAmount > 0)
  .map((booking) => (
  <option
    key={booking.id}
    value={booking.bookingNumber}
  >
    {booking.bookingNumber} - {booking.customerName}
  </option>
))}
    
</select>
        </div>

        <div>
          <label className="block mb-2">Guest Name</label>

          <input
  value={customerName}
  readOnly
  className="w-full border rounded-lg p-3 bg-gray-100"
 />
        </div>
        {selectedBooking && (
  <div className="col-span-2 bg-blue-50 rounded-lg p-4">

    <div className="grid grid-cols-3 gap-4">

      <div>
        <p className="text-gray-500 text-sm">
          Total Amount
        </p>

        <p className="font-bold text-lg">
          ₹{totalAmount}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">
          Advance Paid
        </p>

        <p className="font-bold text-lg text-green-600">
          ₹{advancePaid}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">
          Balance Due
        </p>

        <p className="font-bold text-lg text-red-600">
          ₹{balanceAmount}
        </p>
      </div>

    </div>

  </div>
)}
<div>
  <label className="block mb-2">Amount</label>

  <input
    type="number"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    className="w-full border rounded-lg p-3"
  />
</div>


<div>
  <label className="block mb-2">Payment Method</label>

  <select
    value={paymentMethod}
    onChange={(e) => setPaymentMethod(e.target.value)}
    className="w-full border rounded-lg p-3"
  >
    <option>Cash</option>
    <option>UPI</option>
    <option>Card</option>
    <option>Bank Transfer</option>
  </select>
</div>

<div>
  <label className="block mb-2">Payment Type</label>

<select
  value={paymentType}
 onChange={(e) => {
  const type = e.target.value;

  setPaymentType(type);

  if (!selectedBooking) return;

  if (type === "Balance") {
    setAmount(String(selectedBooking.balanceAmount));
  } else {
    setAmount("");
  }

  setTotalAmount(selectedBooking.totalAmount);
  setAdvancePaid(selectedBooking.advancePaid);
  setBalanceAmount(selectedBooking.balanceAmount);
}}
  className="w-full border rounded-lg p-3"
>
  <option value="Advance">Advance</option>
  <option value="Balance">Balance</option>
  <option value="Extra Charge">Extra Charge</option>
  <option value="Refund">Refund</option>
</select>
</div>

        

        <div className="col-span-2">
          <label className="block mb-2">Notes</label>

          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

      </div>

      <div className="flex justify-end gap-4 mt-8">

        <button
          onClick={() => setShowForm(false)}
          className="px-6 py-3 rounded-lg bg-gray-300"
        >
          Cancel
        </button>

        <button
  onClick={savePayment}
  className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
>
  Save Payment
</button>

      </div>

    </div>
  </div>
)}
        </main>
      </div>
    </div>
  );
}