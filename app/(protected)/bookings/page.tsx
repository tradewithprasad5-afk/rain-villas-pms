"use client";

import BookingModal from "./BookingModal";
import { useEffect, useState } from "react";
import BookingHeader from "./BookingHeader";
import BookingSearch from "./BookingSearch";
import BookingTable from "./BookingTable";
import DeletePinDialog from "./DeletePinDialog";

import { Capacitor } from "@capacitor/core";
import {
  Filesystem,
  Directory,
} from "@capacitor/filesystem";
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

import {
  Booking,
  Customer,
} from "./bookingTypes";

/* ======================================================
   Types
====================================================== */

type EditableBooking = Booking & {
  sourceBookings?: Booking[];
};

/* ======================================================
   Helpers
====================================================== */

function normalizePhone(value?: string) {
  const digits = (value || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return digits.length > 10
    ? digits.slice(-10)
    : digits;
}

function normalizeDate(value?: string) {
  if (!value) {
    return "";
  }

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value.trim();
  }

  return d.toISOString().slice(0, 10);
}

function createBookingGroupId() {
  return `group-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function normalizeName(value?: string) {
  return (value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/*
 * Find every Firestore booking belonging to the same stay.
 * This does NOT merge or delete Firestore documents. It is only
 * used so editing a grouped card always updates both villa records.
 */
function getRelatedStayBookings(
  target: Booking,
  allBookings: Booking[]
) {
  const targetPhone = normalizePhone(target.phone);
  const targetName = normalizeName(target.customerName);
  const targetCheckIn = normalizeDate(target.checkIn);
  const targetCheckOut = normalizeDate(target.checkOut);

  return allBookings.filter((item) => {
    if (item.id === target.id) return true;

    if (
      target.bookingGroupId &&
      item.bookingGroupId &&
      target.bookingGroupId === item.bookingGroupId
    ) {
      return true;
    }

    if (
      normalizeDate(item.checkIn) !== targetCheckIn ||
      normalizeDate(item.checkOut) !== targetCheckOut
    ) {
      return false;
    }

    const itemPhone = normalizePhone(item.phone);
    const itemName = normalizeName(item.customerName);

    if (targetPhone && itemPhone) {
      return targetPhone === itemPhone;
    }

    if (target.customerId && item.customerId) {
      return target.customerId === item.customerId;
    }

    return Boolean(targetName && itemName && targetName === itemName);
  });
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

  const [
    showDeleteDialog,
    setShowDeleteDialog,
  ] = useState(false);

  const [
    bookingToDelete,
    setBookingToDelete,
  ] = useState<Booking | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingCombined, setEditingCombined] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      "all" | "consent" | "pending"
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

  const [
    rainParadiseAmount,
    setRainParadiseAmount,
  ] = useState("");

  const [
    rainHeavenAmount,
    setRainHeavenAmount,
  ] = useState("");

  const [checkIn, setCheckIn] =
    useState("");

  const [checkOut, setCheckOut] =
    useState("");

  const [guests, setGuests] =
    useState(1);

  /* ==========================================
     Payment Information
  ========================================== */

  const [
    totalAmount,
    setTotalAmount,
  ] = useState("");

  const [
    advancePaid,
    setAdvancePaid,
  ] = useState("");

  const [
    balanceAmount,
    setBalanceAmount,
  ] = useState(0);

  const [status, setStatus] =
    useState("Confirmed");

  /* ==========================================
     Both Villas Total
  ========================================== */

  useEffect(() => {
    if (villa !== "Both Villas") {
      return;
    }

    const paradise =
      rainParadiseAmount.trim() === ""
        ? 0
        : Number(rainParadiseAmount);

    const heaven =
      rainHeavenAmount.trim() === ""
        ? 0
        : Number(rainHeavenAmount);

    const combinedTotal =
      (Number.isFinite(paradise)
        ? paradise
        : 0) +
      (Number.isFinite(heaven)
        ? heaven
        : 0);

    setTotalAmount(
      String(combinedTotal)
    );
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
      totalAmount.trim() === ""
        ? 0
        : Number(totalAmount);

    const advance =
      advancePaid.trim() === ""
        ? 0
        : Number(advancePaid);

    if (
      Number.isFinite(total) &&
      Number.isFinite(advance)
    ) {
      setBalanceAmount(
        total - advance
      );
    } else {
      setBalanceAmount(0);
    }
  }, [
    totalAmount,
    advancePaid,
  ]);

  /* ==========================================
     Reset Form
  ========================================== */

  function resetForm() {
    setEditingId(null);
    setEditingCombined(false);

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

      const snapshot =
        await getDocs(
          collection(db, "bookings")
        );

      const data =
        snapshot.docs.map(
          (bookingDoc) => ({
            id: bookingDoc.id,
            ...bookingDoc.data(),
          })
        ) as Booking[];

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
      const snapshot =
        await getDocs(
          collection(db, "customers")
        );

      const data =
        snapshot.docs.map(
          (customerDoc) => ({
            id: customerDoc.id,
            ...customerDoc.data(),
          })
        ) as Customer[];

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
        normalizePhone(
          customer.phone || ""
        ) === normalized
    );
  }

  /* ==========================================
     Auto Fill Customer
  ========================================== */

  function searchCustomerByPhone(
    phoneNumber: string
  ) {
    if (
      phoneNumber.trim() === ""
    ) {
      setCustomerId("");
      setCustomerName("");
      setEmail("");
      setAddress("");
      return;
    }

    const customer =
      findCustomerByPhone(
        phoneNumber
      );

    if (customer) {
      setCustomerId(
        customer.id
      );

      setCustomerName(
        customer.name
      );

      setEmail(
        customer.email
      );

      setAddress(
        customer.address
      );
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
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const villaParam =
      params.get("villa");

    const checkInParam =
      params.get("checkIn");

    const checkOutParam =
      params.get("checkOut");

    if (
      villaParam ||
      checkInParam
    ) {
      setShowForm(true);
    }

    if (villaParam) {
      setVilla(villaParam);
    }

    if (checkInParam) {
      setCheckIn(
        checkInParam
      );
    }

    if (checkOutParam) {
      setCheckOut(
        checkOutParam
      );
    }
  }, []);

  /* ==========================================
     Save Booking
  ========================================== */

  async function saveBooking() {
    /* ==========================================
       BASIC VALIDATION
    ========================================== */

    if (
      !customerName.trim()
    ) {
      alert(
        "Customer Name is required."
      );
      return;
    }

    if (!phone.trim()) {
      alert(
        "Phone Number is required."
      );
      return;
    }

    if (!checkIn) {
      alert(
        "Select Check In Date."
      );
      return;
    }

    if (!checkOut) {
      alert(
        "Select Check Out Date."
      );
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

    /* ==========================================
       PAYMENT VALUES

       Empty = 0

       Confirmed + ₹0 + ₹0 is valid.
    ========================================== */

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

    /* ==========================================
       PAYMENT VALIDATION
    ========================================== */

    if (
      !Number.isFinite(
        finalTotalAmount
      ) ||
      finalTotalAmount < 0
    ) {
      alert(
        "Total Amount cannot be negative."
      );
      return;
    }

    if (
      !Number.isFinite(
        finalAdvancePaid
      ) ||
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

    /* ==========================================
       BOTH VILLAS AMOUNTS
    ========================================== */

    let paradiseAmount = 0;
    let heavenAmount = 0;

    if (
      villa === "Both Villas"
    ) {
      paradiseAmount =
        rainParadiseAmount.trim() ===
        ""
          ? 0
          : Number(
              rainParadiseAmount
            );

      heavenAmount =
        rainHeavenAmount.trim() ===
        ""
          ? 0
          : Number(
              rainHeavenAmount
            );

      if (
        !Number.isFinite(
          paradiseAmount
        ) ||
        paradiseAmount < 0
      ) {
        alert(
          "Rain Paradise amount cannot be negative."
        );
        return;
      }

      if (
        !Number.isFinite(
          heavenAmount
        ) ||
        heavenAmount < 0
      ) {
        alert(
          "Rain Heaven amount cannot be negative."
        );
        return;
      }

      const combinedVillaTotal =
        paradiseAmount +
        heavenAmount;

      if (
        finalAdvancePaid >
        combinedVillaTotal
      ) {
        alert(
          "Advance Paid cannot exceed the combined villa total."
        );
        return;
      }

      if (
        finalTotalAmount !==
        combinedVillaTotal
      ) {
        alert(
          "Total Amount must equal Rain Paradise Amount + Rain Heaven Amount."
        );
        return;
      }
    }

    try {
      /* ==========================================
         FIND CUSTOMER
      ========================================== */

      let finalCustomerId =
        customerId;

      const existingCustomer =
        findCustomerByPhone(phone);

      if (
        existingCustomer
      ) {
        finalCustomerId =
          existingCustomer.id;
      }

      /* ==========================================
         EDIT EXISTING BOOKING
      ========================================== */

      if (editingId) {
        const existingBooking =
          bookings.find(
            (item) =>
              item.id === editingId
          ) as EditableBooking | undefined;

        if (!existingBooking) {
          alert(
            "Booking not found."
          );
          return;
        }

        const relatedStayBookings =
          getRelatedStayBookings(
            existingBooking,
            bookings
          );

        const passedSourceBookings =
          existingBooking.sourceBookings ||
          [];

        const sourceBookings =
          passedSourceBookings.length > 0
            ? passedSourceBookings
            : relatedStayBookings;

        const uniqueSourceBookings =
          Array.from(
            new Map(
              sourceBookings.map((item) => [
                item.id,
                item,
              ])
            ).values()
          );

        const isCombinedBooking =
          uniqueSourceBookings.length >= 2 ||
          existingBooking.villa.includes(
            " + "
          ) ||
          uniqueSourceBookings.some(
            (item) =>
              item.villa === "Both Villas"
          );

        /* ==========================================
           COMBINED BOTH VILLAS EDIT
        ========================================== */

        if (
          isCombinedBooking
        ) {
          if (
            villa !==
            "Both Villas"
          ) {
            alert(
              "This is a combined Both Villas booking. Please keep Villa as Both Villas while editing."
            );
            return;
          }

          const paradiseBooking =
            uniqueSourceBookings.find(
              (item) =>
                item.villa ===
                "Rain Paradise"
            ) ||
            /* Repair an older accidental
             * `Both Villas` source record.
             * It represents the Paradise source
             * when the other source is Rain Heaven.
             */
            uniqueSourceBookings.find(
              (item) =>
                item.villa ===
                "Both Villas"
            );

          const heavenBooking =
            uniqueSourceBookings.find(
              (item) =>
                item.villa ===
                "Rain Heaven"
            );

          if (
            !paradiseBooking ||
            !heavenBooking
          ) {
            alert(
              "Both villa booking records could not be found."
            );
            return;
          }

          const paradiseAdvance =
            finalTotalAmount > 0
              ? Math.round(
                  (finalAdvancePaid *
                    paradiseAmount) /
                    finalTotalAmount
                )
              : 0;

          const heavenAdvance =
            finalAdvancePaid -
            paradiseAdvance;

          const repairGroupId =
            paradiseBooking.bookingGroupId ||
            heavenBooking.bookingGroupId ||
            createBookingGroupId();

          const commonData = {
            customerId:
              finalCustomerId,

            customerName:
              customerName.trim(),

            phone:
              normalizePhone(
                phone
              ),

            checkIn,

            checkOut,

            guests,

            status,

            bookingGroupId: repairGroupId,
          };

          await Promise.all([
            updateDoc(
              doc(
                db,
                "bookings",
                paradiseBooking.id
              ),
              {
                ...commonData,

                villa:
                  "Rain Paradise",

                totalAmount:
                  paradiseAmount,

                advancePaid:
                  paradiseAdvance,

                balanceAmount:
                  paradiseAmount -
                  paradiseAdvance,
              }
            ),

            updateDoc(
              doc(
                db,
                "bookings",
                heavenBooking.id
              ),
              {
                ...commonData,

                villa:
                  "Rain Heaven",

                totalAmount:
                  heavenAmount,

                advancePaid:
                  heavenAdvance,

                balanceAmount:
                  heavenAmount -
                  heavenAdvance,
              }
            ),
          ]);
        }

        /* ==========================================
           SINGLE VILLA EDIT
        ========================================== */

        else {
          const bookingData = {
            customerId:
              finalCustomerId,

            customerName:
              customerName.trim(),

            phone:
              normalizePhone(
                phone
              ),

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

            ...(existingBooking.bookingGroupId
              ? {
                  bookingGroupId:
                    existingBooking.bookingGroupId,
                }
              : {}),
          };

          await updateDoc(
            doc(
              db,
              "bookings",
              editingId
            ),
            bookingData
          );
        }

        /* ==========================================
           UPDATE CUSTOMER AFTER EDIT
        ========================================== */

        if (
          existingCustomer
        ) {
          await updateDoc(
            doc(
              db,
              "customers",
              existingCustomer.id
            ),
            {
              name:
                customerName.trim(),

              phone:
                normalizePhone(
                  phone
                ),

              email,

              address,

              lastStay:
                checkOut,
            }
          );
        } else if (
          finalCustomerId
        ) {
          try {
            await updateDoc(
              doc(
                db,
                "customers",
                finalCustomerId
              ),
              {
                name:
                  customerName.trim(),

                phone:
                  normalizePhone(
                    phone
                  ),

                email,

                address,

                lastStay:
                  checkOut,
              }
            );
          } catch {
            /* Customer document may not exist. */
          }
        }
      }

      /* ==========================================
         CREATE NEW BOOKING
      ========================================== */

      else {
        /* ==========================================
           LOAD EXISTING BOOKINGS
        ========================================== */

        const bookingSnapshot =
          await getDocs(
            collection(
              db,
              "bookings"
            )
          );

        const normalizedPhone =
          normalizePhone(phone);

        const normalizedCheckIn =
          normalizeDate(
            checkIn
          );

        const normalizedCheckOut =
          normalizeDate(
            checkOut
          );

        /* ==========================================
           FIND SAME GUEST + SAME DATES
        ========================================== */

        const sameStayBookings =
          bookingSnapshot.docs
            .map(
              (bookingDoc) => ({
                id: bookingDoc.id,
                ...bookingDoc.data(),
              })
            )
            .filter(
              (item: any) => {
                const sameDates =
                  normalizeDate(
                    item.checkIn
                  ) ===
                    normalizedCheckIn &&
                  normalizeDate(
                    item.checkOut
                  ) ===
                    normalizedCheckOut;

                if (
                  !sameDates
                ) {
                  return false;
                }

                const itemPhone =
                  normalizePhone(
                    item.phone ||
                      ""
                  );

                /* Phone match */

                if (
                  normalizedPhone &&
                  itemPhone
                ) {
                  return (
                    itemPhone ===
                    normalizedPhone
                  );
                }

                /* Customer ID fallback */

                if (
                  finalCustomerId &&
                  item.customerId
                ) {
                  return (
                    item.customerId ===
                    finalCustomerId
                  );
                }

                /* Customer name fallback */

                const itemName =
                  String(
                    item.customerName ||
                      ""
                  )
                    .trim()
                    .replace(
                      /\s+/g,
                      " "
                    )
                    .toLowerCase();

                const currentName =
                  customerName
                    .trim()
                    .replace(
                      /\s+/g,
                      " "
                    )
                    .toLowerCase();

                return (
                  itemName !== "" &&
                  currentName !== "" &&
                  itemName ===
                    currentName
                );
              }
            );

        /* ==========================================
           REQUESTED VILLAS
        ========================================== */

        const requestedVillas =
          villa === "Both Villas"
            ? [
                "Rain Paradise",
                "Rain Heaven",
              ]
            : [villa];

        /* ==========================================
           DUPLICATE VILLA CHECK
        ========================================== */

        const duplicateVilla =
          requestedVillas.find(
            (
              requestedVilla
            ) =>
              sameStayBookings.some(
                (item: any) =>
                  item.villa ===
                  requestedVilla
              )
          );

        if (
          duplicateVilla
        ) {
          alert(
            `${duplicateVilla} is already booked for this guest on the selected dates.`
          );
          return;
        }

        /* ==========================================
           CUSTOMER
        ========================================== */

        if (
          existingCustomer
        ) {
          finalCustomerId =
            existingCustomer.id;

          await updateDoc(
            doc(
              db,
              "customers",
              existingCustomer.id
            ),
            {
              name:
                customerName.trim(),

              phone:
                normalizePhone(
                  phone
                ),

              email,

              address,

              totalBookings:
                (existingCustomer.totalBookings ||
                  0) + 1,

              totalSpent:
                (existingCustomer.totalSpent ||
                  0) +
                finalTotalAmount,

              lastStay:
                checkOut,
            }
          );
        } else {
          const customerRef =
            await addDoc(
              collection(
                db,
                "customers"
              ),
              {
                name:
                  customerName.trim(),

                phone:
                  normalizePhone(
                    phone
                  ),

                email,

                address,

                totalBookings: 1,

                totalSpent:
                  finalTotalAmount,

                lastStay:
                  checkOut,
              }
            );

          finalCustomerId =
            customerRef.id;
        }

        /* ==========================================
           BOOKING NUMBERS
        ========================================== */

        const firstBookingNumber =
          `RV-${String(
            bookingSnapshot.size +
              1
          ).padStart(4, "0")}`;

        const secondBookingNumber =
          `RV-${String(
            bookingSnapshot.size +
              2
          ).padStart(4, "0")}`;

        const bookingGroupId =
          createBookingGroupId();

        /* ==========================================
           BOTH VILLAS
        ========================================== */

        if (
          villa ===
          "Both Villas"
        ) {
          const combinedTotal =
            finalTotalAmount;

          const combinedAdvance =
            finalAdvancePaid;

          /* ==========================================
             PROPORTIONAL ADVANCE SPLIT
          ========================================== */

          const paradiseAdvance =
            combinedTotal > 0
              ? Math.round(
                  (combinedAdvance *
                    paradiseAmount) /
                    combinedTotal
                )
              : 0;

          const heavenAdvance =
            combinedAdvance -
            paradiseAdvance;

          /* ==========================================
             CREATE BOTH SOURCE DOCUMENTS
          ========================================== */

          await Promise.all([
            addDoc(
              collection(
                db,
                "bookings"
              ),
              {
                bookingNumber:
                  firstBookingNumber,

                bookingGroupId,

                customerId:
                  finalCustomerId,

                customerName:
                  customerName.trim(),

                phone:
                  normalizePhone(
                    phone
                  ),

                villa:
                  "Rain Paradise",

                checkIn,

                checkOut,

                guests,

                totalAmount:
                  paradiseAmount,

                advancePaid:
                  paradiseAdvance,

                balanceAmount:
                  paradiseAmount -
                  paradiseAdvance,

                status,

                consentStatus:
                  "Pending",
              }
            ),

            addDoc(
              collection(
                db,
                "bookings"
              ),
              {
                bookingNumber:
                  secondBookingNumber,

                bookingGroupId,

                customerId:
                  finalCustomerId,

                customerName:
                  customerName.trim(),

                phone:
                  normalizePhone(
                    phone
                  ),

                villa:
                  "Rain Heaven",

                checkIn,

                checkOut,

                guests,

                totalAmount:
                  heavenAmount,

                advancePaid:
                  heavenAdvance,

                balanceAmount:
                  heavenAmount -
                  heavenAdvance,

                status,

                consentStatus:
                  "Pending",
              }
            ),
          ]);
        }

        /* ==========================================
           SINGLE VILLA
        ========================================== */

        else {
          await addDoc(
            collection(
              db,
              "bookings"
            ),
            {
              bookingNumber:
                firstBookingNumber,

              bookingGroupId,

              customerId:
                finalCustomerId,

              customerName:
                customerName.trim(),

              phone:
                normalizePhone(
                  phone
                ),

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

      /* ==========================================
         RELOAD DATA
      ========================================== */

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
      console.error(
        "Error saving booking:",
        error
      );

      alert(
        "Unable to save booking."
      );
    }
  }

  /* ==========================================
     Edit Booking
  ========================================== */

  function editBooking(
    booking: Booking
  ) {
    const editableBooking =
      booking as EditableBooking;

    setEditingId(
      editableBooking.id
    );

    setCustomerId(
      editableBooking.customerId
    );

    setCustomerName(
      editableBooking.customerName
    );

    /* ==========================================
       SOURCE BOOKINGS
    ========================================== */

    const passedSourceBookings =
      editableBooking.sourceBookings ||
      [];

    const relatedStayBookings =
      getRelatedStayBookings(
        editableBooking,
        bookings
      );

    /* Prefer the grouped source records when
     * BookingTable supplies them. Otherwise derive
     * the complete stay directly from Firestore data
     * already loaded in this page. */
    const sourceBookings =
      passedSourceBookings.length > 0
        ? passedSourceBookings
        : relatedStayBookings;

    const effectiveSourceBookings =
      Array.from(
        new Map(
          (sourceBookings.length > 0
            ? sourceBookings
            : [editableBooking]
          ).map((item) => [item.id, item])
        ).values()
      );

    /* ==========================================
       DETECT BOTH VILLAS
    ========================================== */

    const hasParadise =
      effectiveSourceBookings.some(
        (item) =>
          item.villa ===
          "Rain Paradise"
      );

    const hasHeaven =
      effectiveSourceBookings.some(
        (item) =>
          item.villa ===
          "Rain Heaven"
      );

    const hasBothLabel =
      effectiveSourceBookings.some(
        (item) =>
          item.villa === "Both Villas"
      );

    const isCombinedBooking =
      effectiveSourceBookings.length >= 2 &&
      ((hasParadise && hasHeaven) ||
        (hasBothLabel && hasHeaven));

    setEditingCombined(isCombinedBooking);

    /* ==========================================
       BOTH VILLAS EDIT
    ========================================== */

    if (
      isCombinedBooking
    ) {
      const paradiseBooking =
        effectiveSourceBookings.find(
          (item) =>
            item.villa ===
            "Rain Paradise"
        ) ||
        effectiveSourceBookings.find(
          (item) =>
            item.villa ===
            "Both Villas"
        );

      const heavenBooking =
        effectiveSourceBookings.find(
          (item) =>
            item.villa ===
            "Rain Heaven"
        );

      setVilla(
        "Both Villas"
      );

      setRainParadiseAmount(
        paradiseBooking
          ? String(
              paradiseBooking.totalAmount ??
                0
            )
          : "0"
      );

      setRainHeavenAmount(
        heavenBooking
          ? String(
              heavenBooking.totalAmount ??
                0
            )
          : "0"
      );

      const combinedTotal =
        effectiveSourceBookings.reduce(
          (sum, item) =>
            sum +
            Number(
              item.totalAmount || 0
            ),
          0
        );

      const combinedAdvance =
        effectiveSourceBookings.reduce(
          (sum, item) =>
            sum +
            Number(
              item.advancePaid || 0
            ),
          0
        );

      const combinedBalance =
        effectiveSourceBookings.reduce(
          (sum, item) =>
            sum +
            Number(
              item.balanceAmount || 0
            ),
          0
        );

      setTotalAmount(
        String(combinedTotal)
      );

      setAdvancePaid(
        String(combinedAdvance)
      );

      setBalanceAmount(
        combinedBalance
      );
    }

    /* ==========================================
       SINGLE VILLA EDIT
    ========================================== */

    else {
      setVilla(
        editableBooking.villa
      );

      if (
        editableBooking.villa ===
        "Rain Paradise"
      ) {
        setRainParadiseAmount(
          String(
            editableBooking.totalAmount ??
              0
          )
        );

        setRainHeavenAmount("");
      } else if (
        editableBooking.villa ===
        "Rain Heaven"
      ) {
        setRainParadiseAmount("");

        setRainHeavenAmount(
          String(
            editableBooking.totalAmount ??
              0
          )
        );
      } else {
        setRainParadiseAmount("");

        setRainHeavenAmount("");
      }

      setTotalAmount(
        String(
          editableBooking.totalAmount ??
            0
        )
      );

      setAdvancePaid(
        String(
          editableBooking.advancePaid ??
            0
        )
      );

      setBalanceAmount(
        Number(
          editableBooking.balanceAmount ??
            0
        )
      );
    }

    /* ==========================================
       COMMON DETAILS
    ========================================== */

    setCheckIn(
      editableBooking.checkIn
    );

    setCheckOut(
      editableBooking.checkOut
    );

    setGuests(
      editableBooking.guests
    );

    setStatus(
      editableBooking.status
    );

    /* ==========================================
       CUSTOMER DETAILS
    ========================================== */

    const customer =
      customers.find(
        (c) =>
          c.id ===
          editableBooking.customerId
      );

    if (customer) {
      setPhone(
        customer.phone ||
          editableBooking.phone ||
          ""
      );

      setEmail(
        customer.email || ""
      );

      setAddress(
        customer.address || ""
      );
    } else {
      setPhone(
        editableBooking.phone || ""
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
    id: string
  ) {
    try {
      await updateDoc(
        doc(
          db,
          "bookings",
          id
        ),
        {
          consentStatus:
            "Completed",
        }
      );

      setBookings((prev) =>
        prev.map(
          (booking) =>
            booking.id === id
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
     Delete Booking
  ========================================== */

  function deleteBooking(
    booking: Booking
  ) {
    setBookingToDelete(
      booking
    );

    setShowDeleteDialog(
      true
    );
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
          collection(
            db,
            "bookings"
          )
        );

      const remainingBookings =
        snapshot.docs
          .map(
            (bookingDoc) => ({
              id: bookingDoc.id,
              ...bookingDoc.data(),
            })
          )
          .filter(
            (booking: any) =>
              booking.customerId ===
              bookingToDelete.customerId
          );

      if (
        remainingBookings.length ===
        0
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

      setBookingToDelete(
        null
      );

      setShowDeleteDialog(
        false
      );
    } catch (error) {
      console.error(
        "Error deleting booking:",
        error
      );

      alert(
        "Unable to delete booking."
      );
    }
  }

  /* ==========================================
     Filter Bookings
  ========================================== */

  const filteredBookings =
    bookings
      .filter((booking) => {
        const keyword =
          search
            .trim()
            .toLowerCase();

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
          (
            booking.bookingNumber ||
            ""
          )
            .toLowerCase()
            .includes(keyword);

        const today =
          new Date();

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
            : filter ===
              "consent"
            ? booking.consentStatus !==
              "Completed"
            : checkInDate >=
              today;

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
    booking: Booking
  ) {
    const editableBooking =
      booking as EditableBooking;

    const customer =
      customers.find(
        (c) =>
          c.id ===
          editableBooking.customerId
      );

    const mobile =
      normalizePhone(
        editableBooking.phone ||
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
      editableBooking.bookingNumber ||
      "";

    const sourceBookings =
      editableBooking.sourceBookings ||
      [editableBooking];

    const uniqueBookings =
      Array.from(
        new Map(
          sourceBookings.map(
            (item) => [
              item.id,
              item,
            ]
          )
        ).values()
      );

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

    if (
      bookingNumbers.length ===
      0
    ) {
      bookingNumbers.push(
        primaryBookingNumber
      );
    }

    if (
      villas.length === 0
    ) {
      villas.push(
        editableBooking.villa
      );
    }

    const consentLink =
      `${window.location.origin}/guest/consent/${primaryBookingNumber}`;

    const message =
      `Hello ${editableBooking.customerName},

Welcome to The Rain Villa 🌿

Please complete your Guest Consent before your arrival.

Booking No: ${bookingNumbers.join(
        " + "
      )}
Villa: ${villas.join(
        " + "
      )}
Stay: ${editableBooking.checkIn} → ${editableBooking.checkOut}

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

    const rows =
      bookings.map(
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
            customer?.email ||
              "",
            customer?.address ||
              "",
            booking.villa ||
              "",
            booking.checkIn ||
              "",
            booking.checkOut ||
              "",
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
        allowBothVillas={
          !editingId || editingCombined
        }

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

        setRainParadiseAmount={
          setRainParadiseAmount
        }

        setRainHeavenAmount={
          setRainHeavenAmount
        }

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