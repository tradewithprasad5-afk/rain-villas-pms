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

  villa: string;

  checkIn: string;
  checkOut: string;

  guests: number;

  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;

  status: string;

  consentStatus?: "Pending" | "Completed";
  phone?: string;
  bookingGroupId?: string;
}

function normalizePhone(value?: string) {
  const digits = (value || "").replace(/\D/g, "");

  if (!digits) return "";

  return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizeDate(value?: string) {
  if (!value) return "";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value;
  }

  return d.toISOString().slice(0, 10);
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

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);

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

  const [customerName, setCustomerName] =
    useState("");

  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");

  const [address, setAddress] = useState("");

  /* ==========================================
     Booking Information
  ========================================== */

  const [villa, setVilla] =
    useState("Rain Paradise");

  const [rainParadiseAmount, setRainParadiseAmount] =
    useState("");

  const [rainHeavenAmount, setRainHeavenAmount] =
    useState("");

  const [checkIn, setCheckIn] = useState("");

  const [checkOut, setCheckOut] = useState("");

  const [guests, setGuests] = useState(1);

  /* ==========================================
     Payment Information
  ========================================== */

  const [totalAmount, setTotalAmount] = useState("");

  const [advancePaid, setAdvancePaid] =
    useState("");

  const [balanceAmount, setBalanceAmount] =
    useState(0);

  const [status, setStatus] =
    useState("Confirmed");

  /* ==========================================
     Both Villas Total
  ========================================== */

  useEffect(() => {
    if (villa === "Both Villas") {
      const combinedTotal =
        (Number(rainParadiseAmount) || 0) +
        (Number(rainHeavenAmount) || 0);

      setTotalAmount(String(combinedTotal));
    }
  }, [
    villa,
    rainParadiseAmount,
    rainHeavenAmount,
  ]);

  /* ==========================================
     Auto Balance
  ========================================== */

  useEffect(() => {
    const total =
      Number(totalAmount) || 0;

    const advance =
      Number(advancePaid) || 0;

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

    setRainParadiseAmount("");

    setRainHeavenAmount("");

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
      console.error(
        "Error loading bookings:",
        error
      );
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
      console.error(
        "Error loading customers:",
        error
      );
    }
  }

  /* ==========================================
     Find Customer By Phone
  ========================================== */

  function findCustomerByPhone(
    phoneNumber: string
  ) {
    const normalized =
      normalizePhone(phoneNumber);

    if (!normalized) {
      return undefined;
    }

    return customers.find(
      (customer) =>
        normalizePhone(customer.phone || "") ===
        normalized
    );
  }

  /* ==========================================
     Auto Fill Customer
  ========================================== */

  function searchCustomerByPhone(
    phoneNumber: string
  ) {
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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
    // -----------------------------
    // Basic Validation
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

    if (
      new Date(checkOut) <=
      new Date(checkIn)
    ) {
      alert(
        "Check Out Date must be after Check In Date."
      );
      return;
    }

    // -----------------------------
    // Normalize Payment Values
    // Empty = 0
    // -----------------------------

    const finalTotalAmount =
      totalAmount.trim() === ""
        ? 0
        : Number(totalAmount);

    const finalAdvancePaid =
      advancePaid.trim() === ""
        ? 0
        : Number(advancePaid);

    const finalBalanceAmount =
      finalTotalAmount -
      finalAdvancePaid;

    // -----------------------------
    // Validate Payment Values
    // -----------------------------

    if (
      !Number.isFinite(finalTotalAmount) ||
      finalTotalAmount < 0
    ) {
      alert("Total Amount cannot be negative.");
      return;
    }

    if (
      !Number.isFinite(finalAdvancePaid) ||
      finalAdvancePaid < 0
    ) {
      alert(
        "Advance Paid cannot be negative."
      );
      return;
    }

    if (
      finalAdvancePaid >
      finalTotalAmount
    ) {
      alert(
        "Advance Paid cannot exceed Total Amount."
      );
      return;
    }

    // -----------------------------
    // Both Villas Validation
    // -----------------------------

    if (villa === "Both Villas") {
      const paradise =
        rainParadiseAmount.trim() === ""
          ? 0
          : Number(rainParadiseAmount);

      const heaven =
        rainHeavenAmount.trim() === ""
          ? 0
          : Number(rainHeavenAmount);

      if (
        !Number.isFinite(paradise) ||
        paradise < 0
      ) {
        alert(
          "Rain Paradise amount cannot be negative."
        );
        return;
      }

      if (
        !Number.isFinite(heaven) ||
        heaven < 0
      ) {
        alert(
          "Rain Heaven amount cannot be negative."
        );
        return;
      }

      if (
        finalAdvancePaid >
        paradise + heaven
      ) {
        alert(
          "Advance Paid cannot exceed the combined villa total."
        );
        return;
      }
    }

    try {
      let finalCustomerId = customerId;

      // -----------------------------
      // Find Existing Customer
      // -----------------------------

      const existingCustomer =
        findCustomerByPhone(phone);

      if (existingCustomer) {
        finalCustomerId =
          existingCustomer.id;

        await updateDoc(
          doc(
            db,
            "customers",
            existingCustomer.id
          ),
          {
            name: customerName,
            phone,
            email,
            address,

            totalBookings:
              (existingCustomer.totalBookings ||
                0) +
              (editingId ? 0 : 1),

            totalSpent:
              (existingCustomer.totalSpent ||
                0) +
              (editingId
                ? 0
                : finalTotalAmount),

            lastStay: checkOut,
          }
        );
      }

      // -----------------------------
      // Create New Customer
      // -----------------------------

      else {
        const customerRef =
          await addDoc(
            collection(db, "customers"),
            {
              name: customerName,
              phone,
              email,
              address,

              totalBookings: 1,

              totalSpent:
                finalTotalAmount,

              lastStay: checkOut,
            }
          );

        finalCustomerId =
          customerRef.id;
      }

      // ==========================================
      // EDIT EXISTING BOOKING
      // ==========================================

      if (editingId) {
        const existingBooking =
          bookings.find(
            (item) =>
              item.id === editingId
          );

        const bookingData = {
          customerId:
            finalCustomerId,

          customerName,

          phone:
            normalizePhone(phone),

          villa,

          checkIn,

          checkOut,

          guests,

          totalAmount:
            finalTotalAmount,

          advancePaid:
            finalAdvancePaid,

          balanceAmount:
            finalBalanceAmount,

          status,

          ...(existingBooking?.bookingGroupId
            ? {
                bookingGroupId:
                  existingBooking.bookingGroupId,
              }
            : {}),
        };

        await updateDoc(
          doc(db, "bookings", editingId),
          bookingData
        );
      }

      // ==========================================
      // CREATE NEW BOOKING
      // ==========================================

      else {
        const bookingSnapshot =
          await getDocs(
            collection(db, "bookings")
          );

        const normalizedPhone =
          normalizePhone(phone);

        const sameStayBookings =
          bookingSnapshot.docs
            .map((bookingDoc) => ({
              id: bookingDoc.id,
              ...bookingDoc.data(),
            }))
            .filter((item: any) => {
              const sameDates =
                normalizeDate(
                  item.checkIn
                ) ===
                  normalizeDate(
                    checkIn
                  ) &&
                normalizeDate(
                  item.checkOut
                ) ===
                  normalizeDate(
                    checkOut
                  );

              if (!sameDates) {
                return false;
              }

              const itemPhone =
                normalizePhone(
                  item.phone || ""
                );

              if (normalizedPhone) {
                return (
                  itemPhone ===
                  normalizedPhone
                );
              }

              return (
                item.customerId ===
                finalCustomerId
              );
            });

        const requestedVillas =
          villa === "Both Villas"
            ? [
                "Rain Paradise",
                "Rain Heaven",
              ]
            : [villa];

        const duplicateVilla =
          requestedVillas.find(
            (requestedVilla) =>
              sameStayBookings.some(
                (item: any) =>
                  item.villa ===
                  requestedVilla
              )
          );

        if (duplicateVilla) {
          alert(
            `${duplicateVilla} is already booked for this guest on the selected dates.`
          );
          return;
        }

        const firstBookingNumber =
          `RV-${String(
            bookingSnapshot.size + 1
          ).padStart(4, "0")}`;

        const secondBookingNumber =
          `RV-${String(
            bookingSnapshot.size + 2
          ).padStart(4, "0")}`;

        const bookingGroupId =
          `group-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;

        const combinedTotal =
          finalTotalAmount;

        const combinedAdvance =
          finalAdvancePaid;

        // ==========================================
        // BOTH VILLAS
        // ==========================================

        if (villa === "Both Villas") {
          const paradiseTotal =
            rainParadiseAmount.trim() === ""
              ? 0
              : Number(
                  rainParadiseAmount
                );

          const heavenTotal =
            rainHeavenAmount.trim() === ""
              ? 0
              : Number(
                  rainHeavenAmount
                );

          const paradiseAdvance =
            combinedTotal > 0
              ? Math.round(
                  (combinedAdvance *
                    paradiseTotal) /
                    combinedTotal
                )
              : 0;

          const heavenAdvance =
            combinedAdvance -
            paradiseAdvance;

          await Promise.all([
            addDoc(
              collection(db, "bookings"),
              {
                bookingNumber:
                  firstBookingNumber,

                bookingGroupId,

                customerId:
                  finalCustomerId,

                customerName,

                phone:
                  normalizePhone(phone),

                villa:
                  "Rain Paradise",

                checkIn,

                checkOut,

                guests,

                totalAmount:
                  paradiseTotal,

                advancePaid:
                  paradiseAdvance,

                balanceAmount:
                  paradiseTotal -
                  paradiseAdvance,

                status,

                consentStatus:
                  "Pending",
              }
            ),

            addDoc(
              collection(db, "bookings"),
              {
                bookingNumber:
                  secondBookingNumber,

                bookingGroupId,

                customerId:
                  finalCustomerId,

                customerName,

                phone:
                  normalizePhone(phone),

                villa:
                  "Rain Heaven",

                checkIn,

                checkOut,

                guests,

                totalAmount:
                  heavenTotal,

                advancePaid:
                  heavenAdvance,

                balanceAmount:
                  heavenTotal -
                  heavenAdvance,

                status,

                consentStatus:
                  "Pending",
              }
            ),
          ]);
        }

        // ==========================================
        // SINGLE VILLA
        // ==========================================

        else {
          await addDoc(
            collection(db, "bookings"),
            {
              bookingNumber:
                firstBookingNumber,

              bookingGroupId,

              customerId:
                finalCustomerId,

              customerName,

              phone:
                normalizePhone(phone),

              villa,

              checkIn,

              checkOut,

              guests,

              totalAmount:
                finalTotalAmount,

              advancePaid:
                finalAdvancePaid,

              balanceAmount:
                finalBalanceAmount,

              status,

              consentStatus:
                "Pending",
            }
          );
        }
      }

      // -----------------------------
      // Reload
      // -----------------------------

      await loadBookings();

      await loadCustomers();

      resetForm();

      setShowForm(false);

      alert(
        editingId
          ? "Booking updated successfully."
          : "Booking created successfully."
      );
    } catch (error) {
      console.error(error);

      alert("Unable to save booking.");
    }
  }

  /* ==========================================
     Edit Booking
  ========================================== */

  async function editBooking(
    booking: Booking
  ) {
    setEditingId(booking.id);

    setCustomerId(
      booking.customerId
    );

    setCustomerName(
      booking.customerName
    );

    setVilla(booking.villa);

    if (
      booking.villa ===
      "Rain Paradise"
    ) {
      setRainParadiseAmount(
        String(
          booking.totalAmount || 0
        )
      );

      setRainHeavenAmount("");
    } else if (
      booking.villa ===
      "Rain Heaven"
    ) {
      setRainParadiseAmount("");

      setRainHeavenAmount(
        String(
          booking.totalAmount || 0
        )
      );
    } else {
      setRainParadiseAmount("");
      setRainHeavenAmount("");
    }

    setCheckIn(
      booking.checkIn
    );

    setCheckOut(
      booking.checkOut
    );

    setGuests(
      booking.guests
    );

    setTotalAmount(
      String(
        booking.totalAmount
      )
    );

    setAdvancePaid(
      String(
        booking.advancePaid
      )
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

    const customer =
      customers.find(
        (c) =>
          c.id ===
          booking.customerId
      );

    if (customer) {
      setPhone(customer.phone);
      setEmail(customer.email);
      setAddress(customer.address);
    } else {
      setPhone(
        booking.phone || ""
      );
      setEmail("");
      setAddress("");
    }

    setShowForm(true);
  }

  /* ==========================================
     Consent Complete
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
            (booking) =>
              booking.id
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

      setBookings((prev) =>
        prev.map((booking) =>
          ids.includes(
            booking.id
          )
            ? {
                ...booking,
                consentStatus:
                  "Completed",
              }
            : booking
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to update consent status."
      );
    }
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
    if (!bookingToDelete) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "bookings",
          bookingToDelete.id
        )
      );

      const snapshot =
        await getDocs(
          collection(db, "bookings")
        );

      const remainingBookings =
        snapshot.docs
          .map((bookingDoc) => ({
            id: bookingDoc.id,
            ...bookingDoc.data(),
          }))
          .filter(
            (booking: any) =>
              booking.customerId ===
              bookingToDelete.customerId
          );

      if (
        remainingBookings.length === 0
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
      console.error(error);

      alert(
        "Unable to delete booking."
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
          .includes(keyword);

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const checkInDate =
        new Date(
          booking.checkIn
        );

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

    const customer =
      customers.find(
        (c) =>
          c.id ===
          booking.customerId
      );

    const mobile =
      normalizePhone(
        booking.phone ||
          customer?.phone ||
          ""
      );

    if (!mobile) {
      alert(
        "Customer phone number not found."
      );
      return;
    }

    const primaryBookingNumber =
      booking.bookingNumber || "";

    const bookingNumbers =
      uniqueBookings
        .map(
          (item) =>
            item.bookingNumber
        )
        .filter(Boolean);

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

    const consentLink =
      `${window.location.origin}/guest/consent/${primaryBookingNumber}`;

    const message =
      `Hello ${booking.customerName},

Welcome to The Rain Villa 🌿

Please complete your Guest Consent before your arrival.

Booking No: ${bookingNumbers.join(
        " + "
      )}
Villa: ${villas.join(
        " + "
      )}
Stay: ${booking.checkIn} → ${booking.checkOut}

Please click the link below to complete ONE consent form for your complete stay:

${consentLink}

Thank you,
The Rain Villa Team`;

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
     Export CSV
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
            (c) =>
              c.id ===
              booking.customerId
          );

        return [
          booking.bookingNumber ||
            "",
          booking.customerName ||
            "",
          customer?.phone ||
            booking.phone ||
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
          booking.consentStatus ||
            "",
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

    if (
      Capacitor.getPlatform() ===
      "web"
    ) {
      const blob = new Blob(
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
    } else {
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
        url: result.uri,
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

        rainParadiseAmount={
          rainParadiseAmount
        }

        rainHeavenAmount={
          rainHeavenAmount
        }

        setRainParadiseAmount={
          setRainParadiseAmount
        }

        setRainHeavenAmount={
          setRainHeavenAmount
        }

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

        setGuests={setGuests}

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

        setStatus={setStatus}

        onSave={saveBooking}

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
        loading={loading}
        onEdit={editBooking}
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

      {/* Delete Dialog */}

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