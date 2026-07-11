"use client";

import { useEffect, useState } from "react";


import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



import { MoreVertical } from "lucide-react";

/* ======================================================
   Interfaces
====================================================== */

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
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

  async function deleteBooking(id: string) {

    const confirmDelete = window.confirm(
      "Delete this booking?"
    );

    if (!confirmDelete) return;

    try {

      await deleteDoc(
        doc(db, "bookings", id)
      );

      await loadBookings();

    }

    catch (error) {

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

    return (
      booking.customerName.toLowerCase().includes(keyword) ||
      booking.villa.toLowerCase().includes(keyword) ||
      booking.status.toLowerCase().includes(keyword)
    );
  })
  .sort(
    (a, b) =>
      new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
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
    /* ==========================================
      Page UI
  ========================================== */

  return (

    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <main className="p-8">

          {/* Header */}

          <div className="flex justify-between items-center mb-8">

            <div>

              <h1 className="text-3xl font-bold">
                Bookings
              </h1>

              <p className="text-gray-500 mt-1">
                Manage customer bookings, payments and consent forms.
              </p>

            </div>

            <button
              onClick={openNewBooking}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            >
              + New Booking
            </button>

          </div>

          {/* Search */}

          <div className="mb-6">

            <input
              type="text"
              placeholder="Search by customer, villa or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-96 border rounded-lg p-3"
            />

          </div>

          {/* Booking Table */}

          <div className="bg-white rounded-xl shadow overflow-hidden">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="p-4 text-left">
                    Customer
                  </th>

                  <th className="p-4 text-left">
                    Phone
                  </th>

                  <th className="p-4 text-left">
                    Villa
                  </th>

                  <th className="p-4 text-left">
                    Check In
                  </th>

                  <th className="p-4 text-left">
                    Check Out
                  </th>

                  <th className="p-4 text-left">
                    Guests
                  </th>

                  <th className="p-4 text-left">
                    Amount
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-center">
  Consent Status
</th>

                  <th className="p-4 text-center">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={10}
                      className="text-center py-10 text-gray-500"
                    >
                      Loading bookings...
                    </td>

                  </tr>

                ) : filteredBookings.length === 0 ? (

                  <tr>

                    <td
                      colSpan={10}
                      className="text-center py-10 text-gray-500"
                    >
                      No bookings found.
                    </td>

                  </tr>

                ) : (

                  filteredBookings.map((booking) => {

                    const customer = customers.find(
                      (c) => c.id === booking.customerId
                    );

                    return (

                      <tr
                        key={booking.id}
                        className="border-t hover:bg-gray-50"
                      >
                                                {/* Customer */}

                        <td className="p-4">
                          {booking.customerName}
                        </td>

                        {/* Phone */}

                        <td className="p-4">
                          {customer?.phone || "-"}
                        </td>

                        {/* Villa */}

                        <td className="p-4">
                          {booking.villa}
                        </td>

                        {/* Check In */}

                        <td className="p-4">
                          {booking.checkIn}
                        </td>

                        {/* Check Out */}

                        <td className="p-4">
                          {booking.checkOut}
                        </td>

                        {/* Guests */}

                        <td className="p-4">
                          {booking.guests}
                        </td>

                        {/* Amount */}

                        <td className="p-4 font-semibold">
                          ₹{booking.totalAmount}
                        </td>

                        {/* Status */}

                        <td className="p-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium

                            ${
                              booking.status === "Confirmed"
                                ? "bg-green-100 text-green-700"

                              : booking.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"

                              : "bg-red-100 text-red-700"
                            }
                          `}
                          >

                            {booking.status}

                          </span>

                        </td>

                        {/* Consent */}

                        <td className="p-4 text-center">

  <span
    className={`px-3 py-1 rounded-full text-sm font-medium ${
      booking.consentStatus === "Completed"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {booking.consentStatus || "Pending"}
  </span>

</td>

                        {/* Actions */}

                        <td className="p-4 text-center">

  <DropdownMenu>

    <DropdownMenuTrigger
  className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-100"
>
  <MoreVertical className="h-4 w-4" />
  Actions
</DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-56">

      <DropdownMenuItem onClick={() => editBooking(booking)}>
        ✏️ Edit Booking
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => sendConsent(booking)}>
        📲 Send Consent
      </DropdownMenuItem>

      {booking.consentStatus === "Completed" ? (
  <DropdownMenuItem
    onClick={() => {
      window.location.href = `/admin/consents/${booking.bookingNumber}`;
    }}
  >
    👁 View Consent
  </DropdownMenuItem>
) : (
  <DropdownMenuItem disabled>
    👁 View Consent
  </DropdownMenuItem>
)}
       
      <DropdownMenuItem
        onClick={() => deleteBooking(booking.id)}
        className="text-red-600"
      >
        🗑 Delete Booking
      </DropdownMenuItem>

    </DropdownMenuContent>

  </DropdownMenu>

</td>

                      </tr>

                    );

                  })

                )}

              </tbody>

            </table>

          </div>
                {/* ==========================================
          Booking Form Modal
      ========================================== */}

      {showForm && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">

            <h2 className="text-2xl font-bold mb-6">

              {editingId
                ? "Edit Booking"
                : "New Booking"}

            </h2>

            {/* ===============================
                Customer Information
            =============================== */}

            <div className="mb-8">

              <h3 className="text-lg font-semibold border-b pb-2 mb-4">

                Customer Information

              </h3>

              <div className="grid grid-cols-2 gap-4">

                {/* Customer Name */}

                <div>

                  <label className="block mb-1 font-medium">

                    Customer Name

                  </label>

                  <input
  type="text"
  value={customerName}
  onChange={(e) =>
    setCustomerName(e.target.value)
  }
  className="w-full border rounded-lg p-3"
  placeholder="Customer Name"
/>

                </div>

                {/* Phone */}

                <div>

                  <label className="block mb-1 font-medium">

                    Phone Number

                  </label>

                  <input
                    type="text"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                    placeholder="9876543210"
                  />

                </div>

                {/* Email */}

                <div>

                  <label className="block mb-1 font-medium">

                    Email

                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                    placeholder="example@email.com"
                  />

                </div>

                {/* Address */}

                <div className="col-span-2">

                  <label className="block mb-1 font-medium">

                    Address

                  </label>

                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                    placeholder="Customer Address"
                  />

                </div>

              </div>

            </div>
                        {/* ===============================
                Booking Information
            =============================== */}

            <div className="mb-8">

              <h3 className="text-lg font-semibold border-b pb-2 mb-4">

                Booking Information

              </h3>

              <div className="grid grid-cols-2 gap-4">

                {/* Villa */}

                <div>

                  <label className="block mb-1 font-medium">

                    Villa

                  </label>

                  <select
                    value={villa}
                    onChange={(e) =>
                      setVilla(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  >

                    <option>Rain Paradise</option>

                    <option>Rain Heaven</option>

                  </select>

                </div>

                {/* Guests */}

                <div>

                  <label className="block mb-1 font-medium">

                    Guests

                  </label>

                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e) =>
                      setGuests(Number(e.target.value))
                    }
                    className="w-full border rounded-lg p-3"
                  />

                </div>

                {/* Check In */}

                <div>

                  <label className="block mb-1 font-medium">

                    Check In

                  </label>

                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) =>
                      setCheckIn(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  />

                </div>

                {/* Check Out */}

                <div>

                  <label className="block mb-1 font-medium">

                    Check Out

                  </label>

                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) =>
                      setCheckOut(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  />

                </div>

              </div>

            </div>
                        {/* ===============================
                Payment Information
            =============================== */}

            <div className="mb-8">

              <h3 className="text-lg font-semibold border-b pb-2 mb-4">

                Payment Information

              </h3>

              <div className="grid grid-cols-2 gap-4">

                {/* Total Amount */}

                <div>

                  <label className="block mb-1 font-medium">
                    Total Amount
                  </label>

                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) =>
                      setTotalAmount(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                    placeholder="Total Amount"
                  />

                </div>

                {/* Advance */}

                <div>

                  <label className="block mb-1 font-medium">
                    Advance Paid
                  </label>

                  <input
                    type="number"
                    value={advancePaid}
                    onChange={(e) =>
                      setAdvancePaid(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                    placeholder="Advance Paid"
                  />

                </div>

                {/* Balance */}

                <div>

                  <label className="block mb-1 font-medium">
                    Balance Amount
                  </label>

                  <input
                    type="number"
                    value={balanceAmount}
                    readOnly
                    className="w-full border rounded-lg p-3 bg-gray-100"
                  />

                </div>

                {/* Status */}

                <div>

                  <label className="block mb-1 font-medium">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  >

                    <option>Confirmed</option>

                    <option>Pending</option>

                    <option>Cancelled</option>

                  </select>

                </div>

              </div>

            </div>

            {/* ===============================
                Buttons
            =============================== */}

            <div className="flex justify-end gap-4">

              <button
                onClick={() => {

                  resetForm();

                  setShowForm(false);

                }}
                className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={saveBooking}
                className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >

                {editingId
                  ? "Update Booking"
                  : "Save Booking"}

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