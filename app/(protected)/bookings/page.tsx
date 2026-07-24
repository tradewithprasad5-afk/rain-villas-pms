"use client";
import BookingModal from "./BookingModal";
import { useEffect, useState } from "react";
import BookingHeader from "./BookingHeader";
import BookingSearch from "./BookingSearch";
import BookingTable from "./BookingTable";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../lib/firebase";


/* ======================================================
   Interfaces
====================================================== */

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;

  totalBookings?: number;
  totalSpent?: number;
  lastStay?: string;
}

interface Booking {
  id: string;

  bookingNumber?: string;

  customerId: string;
  customerName: string;

  villa: string;

  checkIn: string;
  checkOut: string;

  guests: number;

  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;

  status: string;

  consentStatus?: "Pending" | "Completed";
}

/* ======================================================
   Component
====================================================== */

export default function BookingsPage() {

  /* ==========================================
      Lists
  ========================================== */
  
  
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  /* ==========================================
      UI
  ========================================== */

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");
    const [filter, setFilter] = useState<
  "all" | "consent" | "balance" | "both"
>("all");
    

  /* ==========================================
      Customer Information
  ========================================== */

  const [customerId, setCustomerId] =
    useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [address, setAddress] =
    useState("");

  /* ==========================================
      Booking Information
  ========================================== */

  const [villa, setVilla] =
    useState("Rain Paradise");

  const [checkIn, setCheckIn] =
    useState("");

  const [checkOut, setCheckOut] =
    useState("");

  const [guests, setGuests] =
    useState(1);

  /* ==========================================
      Payment Information
  ========================================== */

  const [totalAmount, setTotalAmount] =
    useState("");

  const [advancePaid, setAdvancePaid] =
    useState("");

  const [balanceAmount, setBalanceAmount] =
    useState(0);

  const [status, setStatus] =
    useState("Confirmed");

  /* ==========================================
      Auto Balance
  ========================================== */

  useEffect(() => {

    const total =
      Number(totalAmount) || 0;

    const advance =
      Number(advancePaid) || 0;

    setBalanceAmount(
      total - advance
    );

  }, [totalAmount, advancePaid]);

  /* ==========================================
      Reset Form
  ========================================== */

  function resetForm() {

    setEditingId(null);

    setCustomerId("");

    setCustomerName("");

    setPhone("");

    setEmail("");

    setAddress("");

    setVilla("Rain Paradise");

    setCheckIn("");

    setCheckOut("");

    setGuests(1);

    setTotalAmount("");

    setAdvancePaid("");

    setBalanceAmount(0);

    setStatus("Confirmed");

  }
  /* ==========================================
      Load Bookings
  ========================================== */

  async function loadBookings() {

    try {

      setLoading(true);

      const snapshot = await getDocs(
        collection(db, "bookings")
      );

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      setBookings(data);

    } catch (error) {

      console.error("Error loading bookings:", error);

    } finally {

      setLoading(false);

    }

  }

  /* ==========================================
      Load Customers
  ========================================== */

  async function loadCustomers() {

    try {

      const snapshot = await getDocs(
        collection(db, "customers")
      );

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Customer[];

      setCustomers(data);

    } catch (error) {

      console.error("Error loading customers:", error);

    }

  }

  /* ==========================================
      Find Customer By Phone
  ========================================== */

  function findCustomerByPhone(phoneNumber: string) {

    return customers.find(
      (customer) =>
        customer.phone?.trim() === phoneNumber.trim()
    );

  }
  /* ==========================================
    Auto Fill Customer
========================================== */

function searchCustomerByPhone(phoneNumber: string) {

  if (phoneNumber.trim() === "") {

    setCustomerId("");

    setCustomerName("");

    setEmail("");

    setAddress("");

    return;

  }

  const customer = findCustomerByPhone(phoneNumber);

  if (customer) {

    setCustomerId(customer.id);

    setCustomerName(customer.name);

    setEmail(customer.email);

    setAddress(customer.address);

  }

}

  /* ==========================================
      Initial Load
  ========================================== */

  useEffect(() => {

    loadBookings();

    loadCustomers();

  }, []);
 useEffect(() => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);

  const villa = params.get("villa");
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");

  if (villa || checkIn) {
    setShowForm(true);
  }

  if (villa) setVilla(villa);
  if (checkIn) setCheckIn(checkIn);
  if (checkOut) setCheckOut(checkOut);
}, []);
    /* ==========================================
      Save Booking
  ========================================== */

  async function saveBooking() {

    // -----------------------------
    // Validation
    // -----------------------------

    if (!customerName.trim()) {
      alert("Customer Name is required.");
      return;
    }

    if (!phone.trim()) {
      alert("Phone Number is required.");
      return;
    }

    if (!checkIn) {
      alert("Select Check In Date.");
      return;
    }

    if (!checkOut) {
      alert("Select Check Out Date.");
      return;
    }

    try {

      let finalCustomerId = customerId;

      // -----------------------------
      // Find Existing Customer
      // -----------------------------

      const existingCustomer =
        findCustomerByPhone(phone);

      if (existingCustomer) {

        finalCustomerId = existingCustomer.id;

        await updateDoc(
  doc(db, "customers", existingCustomer.id),
  {
    name: customerName,
    phone,
    email,
    address,
    totalBookings:
      (existingCustomer.totalBookings || 0) + (editingId ? 0 : 1),

    totalSpent:
      (existingCustomer.totalSpent || 0) +
      (editingId ? 0 : Number(totalAmount)),

    lastStay: checkOut,
  }
);

      }

      // -----------------------------
      // Create New Customer
      // -----------------------------

      else {

        const customerRef = await addDoc(

          collection(db, "customers"),

          {
  name: customerName,
  phone,
  email,
  address,

  totalBookings: 1,

  totalSpent: Number(totalAmount),

  lastStay: checkOut,
}

        );

        finalCustomerId = customerRef.id;

      }

      // -----------------------------
// Update Booking
// -----------------------------

if (editingId) {

  const bookingData = {
    customerId: finalCustomerId,
    customerName,
    villa,
    checkIn,
    checkOut,
    guests,
    totalAmount: Number(totalAmount),
    advancePaid: Number(advancePaid),
    balanceAmount,
    status,
  };

  await updateDoc(
    doc(db, "bookings", editingId),
    bookingData
  );
}

// -----------------------------
// New Booking
// -----------------------------

else {

  const bookingSnapshot = await getDocs(
    collection(db, "bookings")
  );

  const bookingNumber =
    `RV-${String(bookingSnapshot.size + 1).padStart(4, "0")}`;

  const bookingData = {
  bookingNumber,
  customerId: finalCustomerId,
  customerName,
  villa,
  checkIn,
  checkOut,
  guests,
  totalAmount: Number(totalAmount),
  advancePaid: Number(advancePaid),
  balanceAmount,
  status,
  consentStatus: "Pending",
};
  
  await addDoc(
    collection(db, "bookings"),
    bookingData
  );

}

      await loadBookings();

      await loadCustomers();

      resetForm();

      setShowForm(false);

      alert(
        editingId
          ? "Booking updated successfully."
          : "Booking created successfully."
      );

    }

    catch (error) {

      console.error(error);

      alert("Unable to save booking.");

    }

  }
    /* ==========================================
      Edit Booking
  ========================================== */

  async function editBooking(booking: Booking) {

    setEditingId(booking.id);

    setCustomerId(booking.customerId);

    setCustomerName(booking.customerName);

    setVilla(booking.villa);

    setCheckIn(booking.checkIn);

    setCheckOut(booking.checkOut);

    setGuests(booking.guests);

    setTotalAmount(
      String(booking.totalAmount)
    );

    setAdvancePaid(
      String(booking.advancePaid)
    );

    setBalanceAmount(
      booking.balanceAmount
    );

    setStatus(
      booking.status
    );

    // -----------------------------
    // Load Customer Details
    // -----------------------------

    const customer = customers.find(
      (c) => c.id === booking.customerId
    );

    if (customer) {

      setPhone(customer.phone);

      setEmail(customer.email);

      setAddress(customer.address);

    }

    setShowForm(true);

  }

  /* ==========================================
      Delete Booking
  ========================================== */
  
  async function markConsentCompleted(id: string) {
  try {
    await updateDoc(doc(db, "bookings", id), {
      consentStatus: "Completed",
    });

    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              consentStatus: "Completed",
            }
          : booking
      )
    );
  } catch (error) {
    console.error(error);
    alert("Unable to update consent status.");
  }
}
  async function deleteBooking(booking: Booking) {

  const confirmDelete = window.confirm("Delete this booking?");

  if (!confirmDelete) return;

  try {

    // Delete booking
    await deleteDoc(doc(db, "bookings", booking.id));

    // Load remaining bookings
    const snapshot = await getDocs(collection(db, "bookings"));

    const remainingBookings = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(
        (b: any) =>
          b.customerId === booking.customerId
      );

    // If customer has no bookings left, delete customer
    if (remainingBookings.length === 0) {
      await deleteDoc(
        doc(db, "customers", booking.customerId)
      );
    }

    await loadBookings();
    await loadCustomers();

  } catch (error) {

    console.error(error);
    alert("Unable to delete booking.");

  }

}

  /* ==========================================
      Filter Bookings
  ========================================== */

  const filteredBookings = bookings
  .filter((booking) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      booking.customerName.toLowerCase().includes(keyword) ||
      booking.villa.toLowerCase().includes(keyword) ||
      booking.status.toLowerCase().includes(keyword);

    const matchesFilter =
      filter === "all"
        ? true
        : filter === "consent"
        ? booking.consentStatus !== "Completed"
        : filter === "balance"
        ? booking.balanceAmount > 0
        : booking.consentStatus !== "Completed" &&
          booking.balanceAmount > 0;

    return matchesSearch && matchesFilter;
  })
  .sort(
    (a, b) =>
      new Date(a.checkIn).getTime() -
      new Date(b.checkIn).getTime()
  );

  /* ==========================================
      Open New Booking
  ========================================== */
  function sendConsent(booking: Booking) {

  const customer = customers.find(
    (c) => c.id === booking.customerId
  );

  if (!customer?.phone) {
    alert("Customer phone number not found.");
    return;
  }
  console.log("APP URL:", process.env.NEXT_PUBLIC_APP_URL);
console.log("Booking:", booking.bookingNumber);

  const consentLink =
  `${process.env.NEXT_PUBLIC_APP_URL}/guest/consent/${booking.bookingNumber}`;

  const message = `Hello ${booking.customerName},

Welcome to The Rain Villa 🌿

Please complete your Guest Consent before your arrival.

Booking No: ${booking.bookingNumber}

Please click the link below to complete your consent form:

${consentLink}

Thank you,
The Rain Villa Team`;

  window.open(
    `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}
  function openNewBooking() {
    

    resetForm();

    setShowForm(true);

  }
  function exportBookingsCSV() {
  const headers = [
    "Booking No",
    "Customer",
    "Phone",
    "Email",
    "Address",
    "Villa",
    "Check In",
    "Check Out",
    "Guests",
    "Total Amount",
    "Advance Paid",
    "Balance Amount",
    "Status",
    "Consent Status",
  ];

  const rows = bookings.map((booking) => {
    const customer = customers.find(
      (c) => c.id === booking.customerId
    );

    return [
      booking.bookingNumber || "",
      booking.customerName || "",
      customer?.phone || "",
      customer?.email || "",
      customer?.address || "",
      booking.villa || "",
      booking.checkIn || "",
      booking.checkOut || "",
      booking.guests,
      booking.totalAmount,
      booking.advancePaid,
      booking.balanceAmount,
      booking.status,
      booking.consentStatus || "",
    ];
  });

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((value) =>
          `"${String(value ?? "").replace(/"/g, '""')}"`
        )
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `Bookings_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}
    /* ==========================================
      Page UI
  ========================================== */

  return (

    <div className="space-y-6">

      

          {/* Header */}

          <BookingHeader
  onNewBooking={openNewBooking}
  onExport={exportBookingsCSV}
/>

          {/* Search */}

          <BookingSearch
  value={search}
  onChange={setSearch}
  filter={filter}
  onFilterChange={setFilter}
/>

          
                {/* ==========================================
          Booking Form Modal
      ========================================== */}

     <BookingModal
  show={showForm}
  editingId={editingId}

  customerName={customerName}
  phone={phone}
  email={email}
  address={address}

  villa={villa}
  guests={guests}
  checkIn={checkIn}
  checkOut={checkOut}

  totalAmount={totalAmount}
  advancePaid={advancePaid}
  balanceAmount={balanceAmount}
  status={status}

  setCustomerName={setCustomerName}

  onPhoneChange={(value) => {
    setPhone(value);
    searchCustomerByPhone(value);
  }}

  setEmail={setEmail}
  setAddress={setAddress}

  setVilla={setVilla}
  setGuests={setGuests}
  setCheckIn={setCheckIn}
  setCheckOut={setCheckOut}

  setTotalAmount={setTotalAmount}
  setAdvancePaid={setAdvancePaid}
  setStatus={setStatus}

  onSave={saveBooking}

  onCancel={() => {
    resetForm();
    setShowForm(false);
  }}
/>

      <BookingTable
        bookings={filteredBookings}
        customers={customers}
        loading={loading}
        onEdit={editBooking}
        onDelete={deleteBooking}
        onSendConsent={sendConsent}
        onCompleteConsent={markConsentCompleted}
      />

    </div>
  );
}
