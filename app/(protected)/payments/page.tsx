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
import {
  Payment,
  Booking,
  Customer,
} from "./paymentTypes";





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
  <>
    <PaymentHeader />

    <PaymentStats
      totalRevenue={totalRevenue}
      totalReceived={totalReceived}
      totalOutstanding={totalOutstanding}
      totalBookings={bookings.length}
    />

    <PaymentSearch
      search={search}
      statusFilter={statusFilter}
      onSearchChange={setSearch}
      onStatusChange={setStatusFilter}
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