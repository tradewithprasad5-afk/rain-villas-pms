"use client";

import BookingModal from "./BookingModal";
import { useEffect, useState } from "react";
import BookingHeader from "./BookingHeader";
import BookingSearch from "./BookingSearch";
import BookingTable from "./BookingTable";
import DeletePinDialog from "./DeletePinDialog";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

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
  phone?: string;

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

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  /* ==========================================
     UI
  ========================================== */

  const [loading, setLoading] = useState(true);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] =
    useState<Booking | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "all" | "consent" | "pending"
  >("all");

  /* ==========================================
     Customer Information
  ========================================== */

  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  /* ==========================================
     Booking Information
  ========================================== */

  const [villa, setVilla] = useState("Rain Paradise");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  /* ==========================================
     Payment Information
  ========================================== */

  const [totalAmount, setTotalAmount] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");
  const [balanceAmount, setBalanceAmount] = useState(0);

  const [status, setStatus] = useState("Confirmed");

  /* ==========================================
     Normalize Phone
  ========================================== */

  function normalizePhone(value: string = "") {
    let normalized = value.replace(/\D/g, "");

    if (normalized.startsWith("91") && normalized.length > 10) {
      normalized = normalized.slice(2);
    }

    return normalized;
  }

  /* ==========================================
     Auto Balance
  ========================================== */

  useEffect(() => {
    const total = Number(totalAmount) || 0;
    const advance = Number(advancePaid) || 0;

    setBalanceAmount(total - advance);
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

      const data = snapshot.docs.map((bookingDoc) => ({
        id: bookingDoc.id,
        ...bookingDoc.data(),
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

      const data = snapshot.docs.map((customerDoc) => ({
        id: customerDoc.id,
        ...customerDoc.data(),
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
    const normalizedPhone = normalizePhone(phoneNumber);

    if (!normalizedPhone) {
      return undefined;
    }

    return customers.find(
      (customer) =>
        normalizePhone(customer.phone) === normalizedPhone
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

    const customer =
      findCustomerByPhone(phoneNumber);

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

  /* ==========================================
     URL Booking Parameters
  ========================================== */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(
      window.location.search
    );

    const villaParam = params.get("villa");
    const checkInParam = params.get("checkIn");
    const checkOutParam = params.get("checkOut");

    if (villaParam || checkInParam) {
      setShowForm(true);
    }

    if (villaParam) {
      setVilla(villaParam);
    }

    if (checkInParam) {
      setCheckIn(checkInParam);
    }

    if (checkOutParam) {
      setCheckOut(checkOutParam);
    }
  }, []);

  /* ==========================================
     Save Booking
  ========================================== */

  async function saveBooking() {
    /* -----------------------------------------
       Validation
    ----------------------------------------- */

    if (!customerName.trim()) {
      alert("Customer Name is required.");
      return;
    }

    if (!phone.trim()) {
      alert("Phone Number is required.");
      return;
    }

    const normalizedPhone = normalizePhone(phone);

    if (normalizedPhone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
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

    if (checkOut <= checkIn) {
      alert("Check Out date must be after Check In date.");
      return;
    }

    const wasEditing = Boolean(editingId);

    try {
      let finalCustomerId = customerId;

      /* -----------------------------------------
         Find Existing Customer
      ----------------------------------------- */

      const existingCustomer =
        findCustomerByPhone(phone);

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;

        await updateDoc(
          doc(
            db,
            "customers",
            existingCustomer.id
          ),
          {
            name: customerName.trim(),
            phone: normalizedPhone,
            email: email.trim(),
            address: address.trim(),

            totalBookings:
              (existingCustomer.totalBookings || 0) +
              (wasEditing ? 0 : 1),

            totalSpent:
              (existingCustomer.totalSpent || 0) +
              (wasEditing
                ? 0
                : Number(totalAmount) || 0),

            lastStay: checkOut,
          }
        );
      }

      /* -----------------------------------------
         Create New Customer
      ----------------------------------------- */

      else {
        const customerRef = await addDoc(
          collection(db, "customers"),
          {
            name: customerName.trim(),
            phone: normalizedPhone,
            email: email.trim(),
            address: address.trim(),

            totalBookings: 1,

            totalSpent:
              Number(totalAmount) || 0,

            lastStay: checkOut,
          }
        );

        finalCustomerId = customerRef.id;
      }

      /* =========================================
         Update Existing Booking
      ========================================= */

      if (editingId) {
        const bookingData = {
          customerId: finalCustomerId,
          customerName: customerName.trim(),
          phone: normalizedPhone,

          villa,

          checkIn,
          checkOut,

          guests,

          totalAmount:
            Number(totalAmount) || 0,

          advancePaid:
            Number(advancePaid) || 0,

          balanceAmount,

          status,
        };

        await updateDoc(
          doc(db, "bookings", editingId),
          bookingData
        );
      }

      /* =========================================
         Create New Booking
      ========================================= */

      else {
        const bookingSnapshot = await getDocs(
          collection(db, "bookings")
        );

        const bookingNumber =
          `RV-${String(
            bookingSnapshot.size + 1
          ).padStart(4, "0")}`;

        const bookingData = {
          bookingNumber,

          customerId: finalCustomerId,
          customerName: customerName.trim(),
          phone: normalizedPhone,

          villa,

          checkIn,
          checkOut,

          guests,

          totalAmount:
            Number(totalAmount) || 0,

          advancePaid:
            Number(advancePaid) || 0,

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
        wasEditing
          ? "Booking updated successfully."
          : "Booking created successfully."
      );
    } catch (error) {
      console.error(
        "Error saving booking:",
        error
      );

      alert("Unable to save booking.");
    }
  }

  /* ==========================================
     Edit Booking
  ========================================== */

  async function editBooking(booking: Booking) {
    setEditingId(booking.id);

    setCustomerId(booking.customerId);

    setCustomerName(
      booking.customerName
    );

    setPhone(
      booking.phone || ""
    );

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

    setStatus(booking.status);

    /* -----------------------------------------
       Load Customer Details
    ----------------------------------------- */

    const customer = customers.find(
      (customerItem) =>
        customerItem.id ===
        booking.customerId
    );

    if (customer) {
      setPhone(
        booking.phone ||
        customer.phone ||
        ""
      );

      setEmail(
        customer.email || ""
      );

      setAddress(
        customer.address || ""
      );
    }

    setShowForm(true);
  }

  /* ==========================================
     Delete Booking
  ========================================== */

  async function deleteBooking(
    booking: Booking
  ) {
    setBookingToDelete(booking);
    setShowDeleteDialog(true);
  }

  async function confirmDeleteBooking() {
    if (!bookingToDelete) return;

    try {
      /* -----------------------------------------
         Delete Booking
      ----------------------------------------- */

      await deleteDoc(
        doc(
          db,
          "bookings",
          bookingToDelete.id
        )
      );

      /* -----------------------------------------
         Check Remaining Customer Bookings
      ----------------------------------------- */

      const snapshot = await getDocs(
        collection(db, "bookings")
      );

      const remainingBookings =
        snapshot.docs
          .map((bookingDoc) => ({
            id: bookingDoc.id,
            ...bookingDoc.data(),
          }))
          .filter(
            (bookingData: any) =>
              bookingData.customerId ===
              bookingToDelete.customerId
          );

      /* -----------------------------------------
         Delete Customer If No Bookings Left
      ----------------------------------------- */

      if (
        remainingBookings.length === 0 &&
        bookingToDelete.customerId
      ) {
        await deleteDoc(
          doc(
            db,
            "customers",
            bookingToDelete.customerId
          )
        );
      }

      await loadBookings();
      await loadCustomers();

      setBookingToDelete(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error(
        "Error deleting booking:",
        error
      );

      alert("Unable to delete booking.");
    }
  }

  /* ==========================================
     Complete Consent
  ========================================== */

  async function markConsentCompleted(
    id: string,
    relatedBookings: Booking[] = []
  ) {
    try {
      const ids = Array.from(
        new Set([
          id,
          ...relatedBookings.map(
            (booking) => booking.id
          ),
        ])
      );

      await Promise.all(
        ids.map((bookingId) =>
          updateDoc(
            doc(
              db,
              "bookings",
              bookingId
            ),
            {
              consentStatus:
                "Completed",
            }
          )
        )
      );

      setBookings((previous) =>
        previous.map((booking) =>
          ids.includes(booking.id)
            ? {
                ...booking,
                consentStatus:
                  "Completed",
              }
            : booking
        )
      );
    } catch (error) {
      console.error(
        "Error updating consent:",
        error
      );

      alert(
        "Unable to update consent status."
      );
    }
  }

  /* ==========================================
     Filter Bookings
  ========================================== */

  const filteredBookings = bookings
    .filter((booking) => {
      const keyword =
        search.toLowerCase();

      const matchesSearch =
        booking.customerName
          .toLowerCase()
          .includes(keyword) ||
        booking.villa
          .toLowerCase()
          .includes(keyword) ||
        booking.status
          .toLowerCase()
          .includes(keyword) ||
        booking.phone
          ?.toLowerCase()
          .includes(keyword) ||
        booking.bookingNumber
          ?.toLowerCase()
          .includes(keyword);

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const checkInDate =
        new Date(booking.checkIn);

      checkInDate.setHours(
        0,
        0,
        0,
        0
      );

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "consent"
          ? booking.consentStatus !==
            "Completed"
          : checkInDate >= today;

      return (
        matchesSearch &&
        matchesFilter
      );
    })
    .sort(
      (a, b) =>
        new Date(
          a.checkIn
        ).getTime() -
        new Date(
          b.checkIn
        ).getTime()
    );

  /* ==========================================
     Send Consent
  ========================================== */

  function sendConsent(
    booking: Booking,
    relatedBookings: Booking[] = []
  ) {
    const allBookings = [
      booking,
      ...relatedBookings,
    ];

    /* -----------------------------------------
       Remove Duplicate Booking IDs
    ----------------------------------------- */

    const uniqueBookings =
      Array.from(
        new Map(
          allBookings.map(
            (item) => [
              item.id,
              item,
            ]
          )
        ).values()
      );

    /* -----------------------------------------
       Find Customer
    ----------------------------------------- */

    const customer =
      customers.find(
        (customerItem) =>
          customerItem.id ===
          booking.customerId
      ) ||
      uniqueBookings
        .map((item) =>
          customers.find(
            (customerItem) =>
              customerItem.id ===
              item.customerId
          )
        )
        .find(Boolean);

    /* -----------------------------------------
       Find Phone
    ----------------------------------------- */

    const mobile =
      booking.phone
        ?.replace(/\D/g, "")
        .replace(/^91/, "") ||
      customer?.phone
        ?.replace(/\D/g, "")
        .replace(/^91/, "") ||
      "";

    if (!mobile) {
      alert(
        "Customer mobile number not found."
      );
      return;
    }

    if (mobile.length !== 10) {
      alert(
        "Customer mobile number is invalid."
      );
      return;
    }

    /* -----------------------------------------
       Booking Numbers
    ----------------------------------------- */

    const bookingNumbers =
      uniqueBookings
        .map(
          (item) =>
            item.bookingNumber
        )
        .filter(
          (
            value
          ): value is string =>
            Boolean(value)
        );

    /* -----------------------------------------
       Villas
    ----------------------------------------- */

    const villas =
      Array.from(
        new Set(
          uniqueBookings
            .map(
              (item) =>
                item.villa
            )
            .filter(Boolean)
        )
      );

    /* -----------------------------------------
       Primary Consent Link
    ----------------------------------------- */

    const primaryBookingNumber =
      booking.bookingNumber;

    if (!primaryBookingNumber) {
      alert(
        "Booking number not found."
      );
      return;
    }

    const consentLink =
      `${window.location.origin}/guest/consent/${primaryBookingNumber}`;

    /* -----------------------------------------
       WhatsApp Message
    ----------------------------------------- */

    const message =
      `Hello ${booking.customerName},

Welcome to The Rain Villa 🌿

Please complete your Guest Consent before your arrival.

Booking No: ${
        bookingNumbers.join(" + ")
      }

Villa: ${
        villas.join(" + ")
      }

Stay: ${
        booking.checkIn
      } → ${
        booking.checkOut
      }

Please click the link below to complete ONE consent form for your complete stay:

${consentLink}

Thank you,
The Rain Villa Team`;

    /* -----------------------------------------
       Open WhatsApp
    ----------------------------------------- */

    window.location.href =
      `https://wa.me/91${mobile}?text=${encodeURIComponent(
        message
      )}`;
  }

  /* ==========================================
     Open New Booking
  ========================================== */

  function openNewBooking() {
    resetForm();
    setShowForm(true);
  }

  /* ==========================================
     Export Bookings CSV
  ========================================== */

  async function exportBookingsCSV() {
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

    const rows = bookings.map(
      (booking) => {
        const customer =
          customers.find(
            (customerItem) =>
              customerItem.id ===
              booking.customerId
          );

        return [
          booking.bookingNumber || "",
          booking.customerName || "",
          booking.phone ||
            customer?.phone ||
            "",
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
      }
    );

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      ),
    ].join("\n");

    const filename =
      `Bookings_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    /* -----------------------------------------
       Web Export
    ----------------------------------------- */

    if (
      Capacitor.getPlatform() ===
      "web"
    ) {
      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;
      link.download =
        filename;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      window.URL.revokeObjectURL(
        url
      );
    }

    /* -----------------------------------------
       Android Export
    ----------------------------------------- */

    else {
      const result =
        await Filesystem.writeFile(
          {
            path: filename,

            data: btoa(
              unescape(
                encodeURIComponent(
                  csv
                )
              )
            ),

            directory:
              Directory.Documents,
          }
        );

      await Share.share({
        title:
          "Bookings Export",

        text:
          "Rain Villa PMS Bookings CSV",

        url:
          result.uri,

        dialogTitle:
          "Save or Share CSV",
      });
    }
  }

  /* ==========================================
     Page UI
  ========================================== */

  return (
    <div className="space-y-6">

      {/* Header */}

      <BookingHeader
        onNewBooking={
          openNewBooking
        }
        onExport={
          exportBookingsCSV
        }
      />

      {/* Search */}

      <BookingSearch
        value={search}
        onChange={setSearch}
        filter={filter}
        onFilterChange={
          setFilter
        }
      />

      {/* Booking Form Modal */}

      <BookingModal
        show={showForm}
        editingId={editingId}

        customerName={
          customerName
        }

        phone={phone}

        email={email}

        address={address}

        villa={villa}

        guests={guests}

        checkIn={checkIn}

        checkOut={checkOut}

        totalAmount={
          totalAmount
        }

        advancePaid={
          advancePaid
        }

        balanceAmount={
          balanceAmount
        }

        status={status}

        setCustomerName={
          setCustomerName
        }

        onPhoneChange={(
          value
        ) => {
          setPhone(value);
          searchCustomerByPhone(
            value
          );
        }}

        setEmail={setEmail}

        setAddress={
          setAddress
        }

        setVilla={setVilla}

        setGuests={
          setGuests
        }

        setCheckIn={
          setCheckIn
        }

        setCheckOut={
          setCheckOut
        }

        setTotalAmount={
          setTotalAmount
        }

        setAdvancePaid={
          setAdvancePaid
        }

        setStatus={
          setStatus
        }

        onSave={
          saveBooking
        }

        onCancel={() => {
          resetForm();
          setShowForm(false);
        }}
      />

      {/* Booking Table */}

      <BookingTable
        bookings={
          filteredBookings
        }

        customers={
          customers
        }

        loading={
          loading
        }

        onEdit={
          editBooking
        }

        onDelete={
          deleteBooking
        }

        onSendConsent={
          sendConsent
        }

        onCompleteConsent={
          markConsentCompleted
        }
      />

      {/* Delete PIN Dialog */}

      <DeletePinDialog
        open={
          showDeleteDialog
        }

        onClose={() => {
          setShowDeleteDialog(
            false
          );

          setBookingToDelete(
            null
          );
        }}

        onVerified={
          confirmDeleteBooking
        }
      />
    </div>
  );
}