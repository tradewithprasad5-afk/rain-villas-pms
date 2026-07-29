"use client";


import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useEffect, useState } from "react";
import PaymentHeader from "./PaymentHeader";
import PaymentStats from "./PaymentStats";
import PaymentSearch from "./PaymentSearch";
import PaymentTable from "./PaymentTable";
import PaymentModal from "./PaymentModal";
import PaymentFilters from "./PaymentFilters";
import {
  Payment,
  Booking,
  Customer,
} from "./paymentTypes";

export default function PaymentsPage() {
    
    const [payments, setPayments] = useState<Payment[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filter, setFilter] = useState<"month" | "year" | "all">("month");
const [loading, setLoading] = useState(true);
const [showForm, setShowForm] = useState(false);
const [search, setSearch] = useState("");

const [dateFilter, setDateFilter] = useState("all");
const [paymentStatus, setPaymentStatus] = useState("all");
const [bookingNumber, setBookingNumber] = useState("");
const [customerName, setCustomerName] = useState("");

const [amount, setAmount] = useState("");
const [paymentMethod, setPaymentMethod] = useState("Cash");
const [paymentType, setPaymentType] = useState("Advance");
const [notes, setNotes] = useState("");
const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
const [bookingParam, setBookingParam] = useState("");
const [whatsappParam, setWhatsappParam] = useState("");
const [totalAmount, setTotalAmount] = useState(0);
const [advancePaid, setAdvancePaid] = useState(0);
const [balanceAmount, setBalanceAmount] = useState(0);
const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

const filteredStatsBookings = bookings.filter((booking) => {
  
  if (!booking.checkIn) return false;

  const checkIn = new Date(booking.checkIn);

  switch (filter) {
    case "month":
      return (
        checkIn.getMonth() === currentMonth &&
        checkIn.getFullYear() === currentYear
      );

    case "year":
  return (
    (booking.checkOut &&
      new Date(booking.checkOut).getFullYear() === currentYear) ||
    checkIn.getFullYear() === currentYear
  );

    case "all":
      return true;
  }
});

const totalRevenue = filteredStatsBookings.reduce(
  (sum, booking) => sum + booking.totalAmount,
  0
);

const totalReceived = filteredStatsBookings.reduce(
  (sum, booking) => sum + booking.advancePaid,
  0
);

const totalOutstanding = filteredStatsBookings.reduce(
  (sum, booking) => sum + booking.balanceAmount,
  0
);

let totalBookings = 0;

filteredStatsBookings.forEach((booking) => {
  
  if (!booking.checkIn || !booking.checkOut) return;

  let current = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);

  while (current < checkOut) {
    if (filter === "month") {
  if (
    current.getMonth() === currentMonth &&
    current.getFullYear() === currentYear
  ) {
    totalBookings++;
  }
} else if (filter === "year") {
  if (current.getFullYear() === currentYear) {
    totalBookings++;
  }
} else {
  totalBookings++;
}
    current.setDate(current.getDate() + 1);
  }
});
async function loadPayments() {
  const snapshot = await getDocs(collection(db, "payments"));

  let data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Payment[];

  const targetBooking = bookingParam || whatsappParam;

if (targetBooking) {
  data = data.filter(
    (payment) => payment.bookingNumber === targetBooking
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

    const targetBooking = bookingParam || whatsappParam;

if (targetBooking) {
      const booking = data.find(
  (b) => b.bookingNumber === targetBooking
);

      if (booking) {
  setSelectedBooking(booking);

  setBookingNumber(booking.bookingNumber);
  setCustomerName(booking.customerName);

  setTotalAmount(booking.totalAmount);
  setAdvancePaid(booking.advancePaid);
  setBalanceAmount(booking.balanceAmount);

  if (bookingParam && booking.balanceAmount > 0) {
  setPaymentType("Balance");
  setAmount(String(booking.balanceAmount));
  setShowForm(true);
}
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
  setWhatsappParam(params.get("whatsapp") || "");
}, []);
useEffect(() => {
  console.log("Payments useEffect", bookingParam, whatsappParam);

  loadBookings();
  loadPayments();
}, [bookingParam, whatsappParam]);



const filteredBookings = bookings
  .filter((booking) => {
    // Search
    const matchesSearch =
      booking.bookingNumber
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      booking.customerName
        .toLowerCase()
        .includes(search.toLowerCase());

    // Payment Status
    const matchesPaymentStatus =
      paymentStatus === "all" ||
      (paymentStatus === "paid" && booking.balanceAmount === 0) ||
      (paymentStatus === "partial" &&
        booking.advancePaid > 0 &&
        booking.balanceAmount > 0) ||
      (paymentStatus === "unpaid" &&
        booking.advancePaid === 0);

    // Date Filter
    let matchesDate = dateFilter === "all";

    if (booking.checkIn) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const bookingDate = new Date(booking.checkIn);
      bookingDate.setHours(0, 0, 0, 0);

      switch (dateFilter) {
        case "today":
          matchesDate =
            bookingDate.getTime() === today.getTime();
          break;

        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);

          matchesDate =
            bookingDate.getTime() === yesterday.getTime();
          break;
        }

        case "last7": {
          const last7 = new Date(today);
          last7.setDate(today.getDate() - 7);

          matchesDate =
            bookingDate >= last7 &&
            bookingDate <= today;
          break;
        }

        case "last30": {
          const last30 = new Date(today);
          last30.setDate(today.getDate() - 30);

          matchesDate =
            bookingDate >= last30 &&
            bookingDate <= today;
          break;
        }

        case "thisMonth":
          matchesDate =
            bookingDate.getMonth() === today.getMonth() &&
            bookingDate.getFullYear() ===
              today.getFullYear();
          break;

        case "lastMonth": {
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);

          matchesDate =
            bookingDate.getMonth() ===
              lastMonth.getMonth() &&
            bookingDate.getFullYear() ===
              lastMonth.getFullYear();
          break;
        }

        default:
          matchesDate = dateFilter === "all";
      }
    }

    return (
      matchesSearch &&
      matchesPaymentStatus &&
      matchesDate
    );
  })
  .sort((a, b) => {
    if (!a.checkIn) return 1;
    if (!b.checkIn) return -1;

    return (
      new Date(b.checkIn).getTime() -
      new Date(a.checkIn).getTime()
    );
  });


  return (
  <>
    <PaymentHeader
  filter={filter}
  onFilterChange={setFilter}
/>

    <PaymentStats
      totalRevenue={totalRevenue}
      totalReceived={totalReceived}
      totalOutstanding={totalOutstanding}
      totalBookings={totalBookings}
    />

    <PaymentSearch
  search={search}
  onSearchChange={setSearch}
/>

<PaymentFilters
  dateFilter={dateFilter}
  paymentStatus={paymentStatus}
  onDateFilterChange={setDateFilter}
  onPaymentStatusChange={setPaymentStatus}
/>


    <PaymentTable
      loading={loading}
  filteredBookings={filteredBookings}
      setSelectedBooking={setSelectedBooking}
      setBookingNumber={setBookingNumber}
      setCustomerName={setCustomerName}
      setTotalAmount={setTotalAmount}
      setAdvancePaid={setAdvancePaid}
      setBalanceAmount={setBalanceAmount}
      setPaymentType={setPaymentType}
      setAmount={setAmount}
      setShowForm={setShowForm}
    />

    <PaymentModal
      showForm={showForm}
      bookings={bookings}
      filteredBookings={filteredBookings}
      bookingNumber={bookingNumber}
      customerName={customerName}
      amount={amount}
      paymentMethod={paymentMethod}
      paymentType={paymentType}
      notes={notes}
      selectedBooking={selectedBooking}
      totalAmount={totalAmount}
      advancePaid={advancePaid}
      balanceAmount={balanceAmount}
      setSelectedBooking={setSelectedBooking}
      setBookingNumber={setBookingNumber}
      setCustomerName={setCustomerName}
      setAmount={setAmount}
      setPaymentMethod={setPaymentMethod}
      setPaymentType={setPaymentType}
      setNotes={setNotes}
      setTotalAmount={setTotalAmount}
      setAdvancePaid={setAdvancePaid}
      setBalanceAmount={setBalanceAmount}
      setShowForm={setShowForm}
      savePayment={savePayment}
    />
  </>
);

}