"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  writeBatch,
  where,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";

export default function ConsentPage() {
  const params = useParams();
  const router = useRouter();

  const bookingNumber = params.bookingNumber as string;

  const [booking, setBooking] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestName, setGuestName] = useState("");

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

 const [houseRules, setHouseRules] = useState(false);
const [poolRules, setPoolRules] = useState(false);
const [damageRules, setDamageRules] = useState(false);
const [zeroTolerance, setZeroTolerance] = useState(false);
const [liabilityWaiver, setLiabilityWaiver] = useState(false);
const [guestDeclaration, setGuestDeclaration] = useState(false);

  const [signature, setSignature] = useState("");

  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  function normalizePhone(value?: string) {
    const digits = (value || "").replace(/\D/g, "");
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  function normalizeDate(value?: string) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString().slice(0, 10);
  }

  function getConsentId(primaryBooking: any) {
    // One consent belongs to one guest stay, not to one Firestore booking.
    // This also handles older records where Paradise and Heaven were booked
    // separately and therefore have different bookingGroupId values.
    const phone = normalizePhone(primaryBooking.phone || "");
    if (phone) {
      return `stay-${phone}-${normalizeDate(primaryBooking.checkIn)}-${normalizeDate(primaryBooking.checkOut)}`;
    }

    if (primaryBooking.customerId) {
      return `stay-customer-${primaryBooking.customerId}-${normalizeDate(primaryBooking.checkIn)}-${normalizeDate(primaryBooking.checkOut)}`;
    }

    return `legacy-booking-${primaryBooking.bookingNumber}`;
  }

  useEffect(() => {
    async function loadBooking() {
      if (!bookingNumber) return;

      try {
        const q = query(
          collection(db, "bookings"),
          where("bookingNumber", "==", bookingNumber)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          alert(`Booking '${bookingNumber}' not found.`);
          return;
        }

        const primaryDoc = snapshot.docs[0];
        const primaryBooking: any = {
          id: primaryDoc.id,
          ...primaryDoc.data(),
        };

        const allSnapshot = await getDocs(collection(db, "bookings"));
        const allBookings = allSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as any[];

        const primaryPhone = normalizePhone(primaryBooking.phone || "");
        const primaryName = (primaryBooking.customerName || "").trim().toLowerCase().replace(/\s+/g, " ");

        const relatedBookings = allBookings.filter((item) => {
          const sameDates =
            normalizeDate(item.checkIn) === normalizeDate(primaryBooking.checkIn) &&
            normalizeDate(item.checkOut) === normalizeDate(primaryBooking.checkOut);

          if (!sameDates) return false;
          if (item.id === primaryBooking.id) return true;

          const itemPhone = normalizePhone(item.phone || "");
          const itemName = (item.customerName || "").trim().toLowerCase().replace(/\s+/g, " ");

          const samePhone = Boolean(primaryPhone && itemPhone && primaryPhone === itemPhone);
          const sameCustomer = Boolean(
            primaryBooking.customerId &&
              item.customerId &&
              primaryBooking.customerId === item.customerId
          );
          const sameName = Boolean(primaryName && itemName && primaryName === itemName);
          const sameGroup = Boolean(
            primaryBooking.bookingGroupId &&
              item.bookingGroupId &&
              primaryBooking.bookingGroupId === item.bookingGroupId
          );

          return samePhone || sameCustomer || sameName || sameGroup;
        });

        const sourceBookings = relatedBookings.length
          ? relatedBookings
          : [primaryBooking];

        const bookingData: any = {
          ...primaryBooking,
          bookingNumbers: Array.from(
            new Set(sourceBookings.map((item) => item.bookingNumber).filter(Boolean))
          ),
          villas: Array.from(
            new Set(sourceBookings.map((item) => item.villa).filter(Boolean))
          ),
          sourceBookingIds: sourceBookings.map((item) => item.id),
          bookingGroupId: primaryBooking.bookingGroupId || "",
          consentId: getConsentId(primaryBooking),
          phone: primaryBooking.phone || "",
        };

        setBooking(bookingData);
        setGuestName(bookingData.customerName || "");

        if (bookingData.customerId) {
          const customerDoc = await getDoc(
            doc(db, "customers", bookingData.customerId)
          );

          if (customerDoc.exists()) {
            setCustomer({
              id: customerDoc.id,
              ...customerDoc.data(),
            });
          }
        }

        const consentId = getConsentId(primaryBooking);
        const consentDoc = await getDoc(doc(db, "consents", consentId));

        if (consentDoc.exists()) {
          router.replace("/guest/consent/consent-already-submitted");
          return;
        }

        // Compatibility with consents created by the previous grouped-booking version.
        if (primaryBooking.bookingGroupId) {
          const legacyGroupConsent = await getDoc(
            doc(db, "consents", `group-${primaryBooking.bookingGroupId}`)
          );
          if (legacyGroupConsent.exists()) {
            router.replace("/guest/consent/consent-already-submitted");
            return;
          }
        }

        // Compatibility check for old consent documents created before
        // bookingGroupId existed.
        for (const sourceBooking of sourceBookings) {
          if (!sourceBooking.bookingNumber) continue;
          const legacyConsent = await getDoc(
            doc(db, "consents", sourceBooking.bookingNumber)
          );
          if (legacyConsent.exists()) {
            router.replace("/guest/consent/consent-already-submitted");
            return;
          }
        }
      } catch (error) {
        console.error("Failed to load booking for consent:", error);
        alert("Unable to load the booking. Please try again.");
      }
    }

    loadBooking();
  }, [bookingNumber, router]);

  async function saveConsent() {
    if (saving) return;

    if (!booking) return;

    setSaving(true);

    try {
      if (
        !houseRules ||
        !poolRules ||
        !damageRules ||
        !zeroTolerance ||
        !liabilityWaiver ||
        !guestDeclaration
      ) {
        alert("Please accept all sections before submitting.");
        return;
      }

      if (!signature.trim()) {
        alert("Please enter your digital signature.");
        return;
      }

      if (!guestName.trim()) {
        alert("Please enter the guest full name.");
        return;
      }

      const sourceBookingIds: string[] = booking.sourceBookingIds || [booking.id];
      const bookingNumbers: string[] = booking.bookingNumbers || [booking.bookingNumber];
      const villas: string[] = booking.villas || [booking.villa];
      const consentId = booking.consentId || getConsentId(booking);
      const phone = customer?.phone || booking.phone || "";
      const email = customer?.email || booking.email || "";

      if (!sourceBookingIds.length) {
        alert("Unable to identify the booking records. Please contact the villa.");
        return;
      }

      const existingConsent = await getDoc(doc(db, "consents", consentId));
      if (existingConsent.exists()) {
        router.replace("/guest/consent/consent-already-submitted");
        return;
      }

      // One atomic batch is important here. It prevents the consent document
      // from being created successfully while one of the source booking
      // updates fails, which could leave a partial/incorrect consent state.
      const batch = writeBatch(db);

      const consentRef = doc(db, "consents", consentId);
      batch.set(consentRef, {
        consentId,
        bookingGroupId: booking.bookingGroupId || "",
        bookingNumber: bookingNumbers[0] || booking.bookingNumber,
        bookingNumbers,
        customerName: guestName.trim(),
        villa: villas
          .flatMap((villa) =>
            villa === "Both Villas"
              ? ["Rain Paradise", "Rain Heaven"]
              : [villa]
          )
          .filter(Boolean)
          .filter((villa, index, list) => list.indexOf(villa) === index)
          .join(" + "),
        villas: villas
          .flatMap((villa) =>
            villa === "Both Villas"
              ? ["Rain Paradise", "Rain Heaven"]
              : [villa]
          )
          .filter(Boolean)
          .filter((villa, index, list) => list.indexOf(villa) === index),
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        sourceBookingIds,
        phone,
        email,
        adults,
        children,
        vehicleNumber: vehicleNumber.trim(),
        emergencyContact: emergencyContact.trim(),
        signature: signature.trim(),
        houseRules,
        poolRules,
        damageRules,
        zeroTolerance,
        liabilityWaiver,
        guestDeclaration,
        createdAt: serverTimestamp(),
      });

      sourceBookingIds.forEach((bookingId) => {
        batch.update(doc(db, "bookings", bookingId), {
          consentStatus: "Completed",
          customerName: guestName.trim(),
          phone,
          adults,
          children,
          vehicleNumber: vehicleNumber.trim(),
          emergencyContact: emergencyContact.trim(),
          consentId,
          consentSubmittedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      router.push("/guest/thank-you");
    } catch (error: any) {
      console.error("Failed to submit guest consent:", error);

      const code = error?.code || "";
      if (code === "permission-denied") {
        alert(
          "Consent submission was not permitted. Please contact The Rain Villa management."
        );
      } else if (code === "failed-precondition") {
        alert(
          "Consent could not be submitted because the booking data is not ready. Please contact The Rain Villa management."
        );
      } else {
        alert(
          "Unable to submit consent. Please check your internet connection and try again."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

  <main className="max-w-6xl mx-auto px-4 py-10">

    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* Header */}

      <div className="bg-slate-800 px-8 py-6">

        <h1 className="text-3xl font-bold text-white">
          THE RAIN VILLA
        </h1>

        <p className="text-slate-200 mt-2">
          Guest Check-in Consent & Liability Agreement
        </p>

      </div>

      <div className="p-8 space-y-10">

        {/* Welcome */}

        <section className="rounded-xl border border-green-300 bg-green-50 p-6">

          <h2 className="text-2xl font-bold text-green-700">
            Welcome 🌿
          </h2>

          <p className="mt-4 text-gray-700 leading-8">

            Welcome to <strong>The Rain Villa</strong>.

            <br /><br />

            We sincerely appreciate your reservation.

            This Guest Consent Agreement is designed to ensure the
            safety, comfort and enjoyment of every guest staying
            at our property.

            <br /><br />

            Please read every section carefully before submitting
            your consent.

          </p>

        </section>

        {/* Important Notice */}

        <section className="rounded-xl border border-amber-300 bg-amber-50 p-6">

          <h2 className="text-xl font-bold text-amber-700">
            Important Notice
          </h2>

          <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">

            <li>This consent is mandatory before check-in.</li>

            <li>Every section must be accepted before submission.</li>

            <li>Your digital signature has the same legal validity as a handwritten signature.</li>

            <li>Providing false information may result in cancellation of the booking.</li>

          </ul>

        </section>

        {/* A. BOOKING DETAILS */}

        <section>

          <div className="bg-slate-800 text-white px-5 py-3 rounded-t-lg">

            <h2 className="text-xl font-bold">
              A. BOOKING DETAILS
            </h2>

          </div>

          <div className="border border-t-0 rounded-b-lg p-6">

            <div className="grid md:grid-cols-2 gap-6">

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Booking Number
                </label>

                <input
                  readOnly
                  value={(booking.bookingNumbers || [booking.bookingNumber]).join(" + ")}
                  className="w-full rounded-lg border bg-gray-100 p-3"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Villa
                </label>

                <input
                  readOnly
                  value={(booking.villas || [booking.villa]).join(" + ")}
                  className="w-full rounded-lg border bg-gray-100 p-3"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Check-In
                </label>

                <input
                  readOnly
                  value={booking.checkIn}
                  className="w-full rounded-lg border bg-gray-100 p-3"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Check-Out
                </label>

                <input
                  readOnly
                  value={booking.checkOut}
                  className="w-full rounded-lg border bg-gray-100 p-3"
                />

              </div>

            </div>

          </div>

        </section>
                {/* B. GUEST DETAILS */}

        <section>

          <div className="bg-slate-800 text-white px-5 py-3 rounded-t-lg">

            <h2 className="text-xl font-bold">
              B. GUEST DETAILS
            </h2>

          </div>

          <div className="border border-t-0 rounded-b-lg p-6">

            <div className="grid md:grid-cols-2 gap-6">

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Guest Name
                </label>

                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter guest full name"
                  className="w-full rounded-lg border p-3"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Mobile Number
                </label>

                <input
  type="tel"
  inputMode="numeric"
  value={customer?.phone || ""}
  onChange={(e) =>
    setCustomer((prev: any) => ({
      ...prev,
      phone: e.target.value,
    }))
  }
  placeholder="Enter mobile number"
  className="w-full rounded-lg border p-3"
/>

              </div>

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Email Address
                </label>

                <input
  type="email"
  inputMode="email"
  value={customer?.email || ""}
  onChange={(e) =>
    setCustomer((prev: any) => ({
      ...prev,
      email: e.target.value,
    }))
  }
  placeholder="Enter email address"
  className="w-full rounded-lg border p-3"
/>

              </div>

              

            </div>

          </div>

        </section>

        
                {/* C. GUEST STAY DETAILS */}

        <section>

          <div className="bg-slate-800 text-white px-5 py-3 rounded-t-lg">

            <h2 className="text-xl font-bold">
              C. GUEST STAY DETAILS
            </h2>

          </div>

          <div className="border border-t-0 rounded-b-lg p-6">

            <p className="text-gray-700 mb-6">
              Kindly provide the following details regarding your stay.
            </p>

            <div className="grid md:grid-cols-2 gap-6">

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Number of Adults
                </label>

                <input
                  type="number"
                  min={1}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full rounded-lg border p-3"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Number of Children
                </label>

                <input
                  type="number"
                  min={0}
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full rounded-lg border p-3"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Vehicle Number
                </label>

                <input
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="MH-15-AB-1234"
                  className="w-full rounded-lg border p-3"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Emergency Contact
                </label>

                <input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Emergency Contact Number"
                  className="w-full rounded-lg border p-3"
                />

              </div>

            </div>

            <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-5">

              <h3 className="font-semibold text-blue-700 mb-3">
                Guest Information
              </h3>

              <ul className="list-disc pl-6 space-y-2 text-gray-700">

                <li>
                  Only registered guests are permitted to stay at the villa.
                </li>

                <li>
                  Visitors require prior approval from management.
                </li>

                <li>
                  Guest capacity must not exceed the confirmed booking.
                </li>

                <li>
                  Vehicle parking is available only for registered guests.
                </li>

                <li>
                  Emergency contact details are required for guest safety.
                </li>

              </ul>

            </div>

          </div>

        </section>

        {/* D. ACKNOWLEDGMENT OF HOUSE RULES */}

        <section>

          <div className="bg-slate-800 text-white px-5 py-3 rounded-t-lg">

            <h2 className="text-xl font-bold">
              D. ACKNOWLEDGMENT OF HOUSE RULES
            </h2>

          </div>

          <div className="border border-t-0 rounded-b-lg p-6">

            <p className="italic text-gray-600 mb-6">
              Please read and agree to the following house rules.
            </p>

            <div className="space-y-4">

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">1. Pool Rules</h3>
                <p className="text-gray-700 mt-2">
                  Shower before entering the pool. Children must always be supervised.
                  No glass bottles, food or drinks inside the pool.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">2. Kitchen Rules</h3>
                <p className="text-gray-700 mt-2">
                  Keep the kitchen clean after use. Switch off gas and electrical
                  appliances before leaving.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">3. Bathroom Rules</h3>
                <p className="text-gray-700 mt-2">
                  Do not flush sanitary products or plastic items.
                  Report plumbing issues immediately.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">4. Quiet Hours</h3>
                <p className="text-gray-700 mt-2">
                  Quiet hours are from 12:00 AM to 7:00 AM.
                  Please respect neighbouring villas.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">5. Check-out</h3>
                <p className="text-gray-700 mt-2">
                  Standard check-out is 11:00 AM.
                  Late check-out is chargeable unless approved.
                </p>
              </div>

            </div>

            <label className="flex items-start gap-3 mt-8">

              <input
  type="checkbox"
  checked={houseRules}
onChange={(e) => setHouseRules(e.target.checked)}
  className="mt-1"
/>

              <span>
                I have read, understood and agree to comply with all House Rules.
              </span>

            </label>

          </div>

        </section>
                {/* E. SWIMMING POOL – LIABILITY & RULES */}

        <section>

          <div className="bg-slate-800 text-white px-5 py-3 rounded-t-lg">

            <h2 className="text-xl font-bold">
              E. SWIMMING POOL – LIABILITY & RULES
            </h2>

          </div>

          <div className="border border-t-0 rounded-b-lg p-6">

            <div className="rounded-lg border border-red-300 bg-red-50 p-5 mb-6">

              <h3 className="font-semibold text-red-700 text-lg">
                ⚠ IMPORTANT SAFETY NOTICE
              </h3>

              <p className="mt-2 text-gray-700">
                The swimming pool is unsupervised and there is no lifeguard on
                duty. Guests use the swimming pool entirely at their own risk.
              </p>

            </div>

            <div className="space-y-5">

              <div>

                <h3 className="font-semibold">
                  1. Assumption of Risk
                </h3>

                <p className="text-gray-700 mt-2">
                  I voluntarily assume all risks associated with swimming.
                </p>

              </div>

              <div>

                <h3 className="font-semibold">
                  2. Children
                </h3>

                <p className="text-gray-700 mt-2">
                  Children must always remain under adult supervision.
                </p>

              </div>

              <div>

                <h3 className="font-semibold">
                  3. Glass Articles
                </h3>

                <p className="text-gray-700 mt-2">
                  Glass bottles, glasses and sharp objects are strictly
                  prohibited near the swimming pool.
                </p>

              </div>

              <div>

                <h3 className="font-semibold">
                  4. Alcohol
                </h3>

                <p className="text-gray-700 mt-2">
                  Guests under the influence of alcohol or drugs should
                  not enter the swimming pool.
                </p>

              </div>

              <div>

                <h3 className="font-semibold">
                  5. Liability
                </h3>

                <p className="text-gray-700 mt-2">
                  The Rain Villa shall not be liable for accidents,
                  injuries or loss of personal belongings arising from
                  the use of the swimming pool.
                </p>

              </div>

            </div>

            <label className="flex items-start gap-3 mt-8">

              <input
                type="checkbox"
                checked={poolRules}
                onChange={(e) => setPoolRules(e.target.checked)}
                className="mt-1"
              />

              <span>
                I have read and agree to the Swimming Pool Liability Rules.
              </span>

            </label>

          </div>

        </section>

        {/* F. DAMAGE TO PROPERTY & FINANCIAL LIABILITY */}

        <section>

          <div className="bg-slate-800 text-white px-5 py-3 rounded-t-lg">

            <h2 className="text-xl font-bold">
              F. DAMAGE TO PROPERTY & FINANCIAL LIABILITY
            </h2>

          </div>

          <div className="border border-t-0 rounded-b-lg p-6">

            <p className="text-gray-700 mb-6">
              Guests are financially responsible for any loss or damage
              caused to villa property during their stay.
            </p>

            <div className="overflow-x-auto">

              <table className="w-full border text-sm">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="border p-3 text-left">
                      Penalty / Damage
                    </th>

                    <th className="border p-3 text-left">
                      Replacement / Deduction
                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr>
                    <td className="border p-3">Broken / Damaged TV, Sound System, Appliance</td>
                    <td className="border p-3">Actual Repair / Replacement Cost</td>
                  </tr>

                  <tr>
                    <td className="border p-3">Broken / Damaged Pool Table / TT Table</td>
                    <td className="border p-3">Actual Repair / Replacement Cost</td>
                  </tr>

                  <tr>
                    <td className="border p-3">Burned / Stained Sofa, Bedsheet, Cushion</td>
                    <td className="border p-3">₹500 – ₹2,000</td>
                  </tr>

                  <tr>
                    <td className="border p-3">Broken Bathroom Fittings</td>
                    <td className="border p-3">₹500 – ₹2,000</td>
                  </tr>

                  <tr>
                    <td className="border p-3">Lost Villa Keys / Remote</td>
                    <td className="border p-3">₹500</td>
                  </tr>

                  <tr>
                    <td className="border p-3">Excessive Cleaning</td>
                    <td className="border p-3">₹1,000 – ₹3,000</td>
                  </tr>

                  <tr>
                    <td className="border p-3">Stained / Burned Mattress</td>
                    <td className="border p-3">₹2,000 – ₹5,000</td>
                  </tr>

                  <tr>
                    <td className="border p-3">Glass in Pool</td>
                    <td className="border p-3">₹1,000 + Actual Cleaning Cost</td>
                  </tr>

                  <tr>
                    <td className="border p-3">Missing Kitchen Utensils / Crockery</td>
                    <td className="border p-3">₹100 – ₹500 per item</td>
                  </tr>

                  <tr>
                    <td className="border p-3">Unregistered Guests</td>
                    <td className="border p-3">₹1,000 per person</td>
                  </tr>

                  <tr>
                    <td className="border p-3">Late Check-out</td>
                    <td className="border p-3">₹1,000 per hour</td>
                  </tr>

                </tbody>

              </table>

            </div>

            <label className="flex items-start gap-3 mt-8">

              <input
                type="checkbox"
                checked={damageRules}
                onChange={(e) => setDamageRules(e.target.checked)}
                className="mt-1"
              />

              <span>
                I have read, understood and agree to the Financial Liability Policy.
              </span>

            </label>

          </div>

        </section>
                {/* G. STRICT PROHIBITIONS & ZERO TOLERANCE */}

        <section>

          <div className="bg-red-800 text-white px-5 py-3 rounded-t-lg">

            <h2 className="text-xl font-bold">
              G. STRICT PROHIBITIONS & ZERO TOLERANCE
            </h2>

          </div>

          <div className="border border-t-0 rounded-b-lg p-6">

            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">

              <h3 className="text-lg font-bold text-red-700">
                ⚠ VIOLATION = IMMEDIATE EVICTION + POLICE ACTION + NO REFUND
              </h3>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full border text-sm">

                <thead className="bg-red-700 text-white">

                  <tr>

                    <th className="border p-3">
                      Strictly Prohibited
                    </th>

                    <th className="border p-3">
                      Consequence
                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr>
                    <td className="border p-3">🚫 Illegal Drugs / Narcotics</td>
                    <td className="border p-3">Eviction + Police + No Refund</td>
                  </tr>

                  <tr>
                    <td className="border p-3">🚫 Hookah / Shisha / Hubble Bubble</td>
                    <td className="border p-3">₹5,000 Fine + Eviction if repeated</td>
                  </tr>

                  <tr>
                    <td className="border p-3">🚫 Violence / Assault / Abuse</td>
                    <td className="border p-3">Eviction + Police + No Refund</td>
                  </tr>

                  <tr>
                    <td className="border p-3">🚫 Smoking Indoors</td>
                    <td className="border p-3">₹2,000 Fine</td>
                  </tr>

                  <tr>
                    <td className="border p-3">🚫 Weapons / Firearms</td>
                    <td className="border p-3">Eviction + Police Complaint</td>
                  </tr>

                </tbody>

              </table>

            </div>

            <label className="flex items-start gap-3 mt-6">

              <input
                type="checkbox"
                checked={zeroTolerance}
                onChange={(e) => setZeroTolerance(e.target.checked)}
                className="mt-1"
              />

              <span>
                I have read and agree to the Zero Tolerance Policy.
              </span>

            </label>

          </div>

        </section>
                {/* H. GENERAL LIABILITY WAIVER */}

        <section>

          <div className="bg-slate-800 text-white px-5 py-3 rounded-t-lg">

            <h2 className="text-xl font-bold">
              H. GENERAL LIABILITY WAIVER
            </h2>

          </div>

          <div className="border border-t-0 rounded-b-lg p-6">

            <div className="space-y-6">

              <div className="rounded-lg border border-gray-200 p-5">

                <h3 className="font-semibold text-slate-700">
                  1. Power Backup
                </h3>

                <p className="mt-2 text-gray-700">
                  Power backup is available only for Fans, Lights and Wi-Fi.
                  Air Conditioners, Geysers and other heavy electrical
                  appliances are not connected to the backup system.
                  Igatpuri generally enjoys a naturally cool climate.
                </p>

              </div>

              <div className="rounded-lg border border-gray-200 p-5">

                <h3 className="font-semibold text-slate-700">
                  2. Personal Belongings
                </h3>

                <p className="mt-2 text-gray-700">
                  The Rain Villa shall not be responsible for the loss,
                  theft or damage of cash, jewellery, electronic devices,
                  vehicles or any personal belongings kept within or
                  outside the property.
                </p>

              </div>

              <div className="rounded-lg border border-gray-200 p-5">

                <h3 className="font-semibold text-slate-700">
                  3. Medical Emergency
                </h3>

                <p className="mt-2 text-gray-700">
                  In case of illness, injury or emergency, the guest
                  authorizes villa management to contact emergency
                  medical services. All expenses arising from medical
                  treatment remain solely the responsibility of the guest.
                </p>

              </div>

              <div className="rounded-lg border border-gray-200 p-5">

                <h3 className="font-semibold text-slate-700">
                  4. Force Majeure
                </h3>

                <p className="mt-2 text-gray-700">
                  The Rain Villa shall not be liable for disruption,
                  cancellation or inconvenience caused by heavy rain,
                  landslides, natural disasters, government restrictions,
                  electricity failures or any event beyond management's
                  reasonable control. Refunds, where applicable, shall
                  follow the booking cancellation policy.
                </p>

              </div>

            </div>

            <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-5">

              <p className="text-gray-700 leading-7">

                By accepting this waiver, I acknowledge that I have read,
                understood and voluntarily agree to release The Rain Villa,
                its owners, management and staff from liability for any
                personal injury, accident, property loss or inconvenience,
                except where prohibited by applicable law.

              </p>

            </div>

            <label className="flex items-start gap-3 mt-8">

              <input
                type="checkbox"
                checked={liabilityWaiver}
                onChange={(e) => setLiabilityWaiver(e.target.checked)}
                className="mt-1"
              />

              <span>
                I have read, understood and agree to the General Liability Waiver.
              </span>

            </label>

          </div>

        </section>
                {/* I. GUEST DECLARATION */}

        <section>

          <div className="bg-green-700 text-white px-5 py-3 rounded-t-lg">

            <h2 className="text-xl font-bold">
              I. GUEST DECLARATION
            </h2>

          </div>

          <div className="border border-t-0 rounded-b-lg p-6">

            <div className="rounded-lg bg-green-50 border border-green-300 p-6">

              <h3 className="text-lg font-semibold text-green-700 mb-4">
                Declaration by Guest
              </h3>

              <ul className="list-disc pl-6 space-y-3 text-gray-700">

                <li>
                  I confirm that all information provided by me in this
                  consent form is true, accurate and complete.
                </li>

                <li>
                  I have carefully read and understood every section of
                  this Guest Consent Agreement before submitting it.
                </li>

                <li>
                  I voluntarily agree to comply with all House Rules,
                  Safety Guidelines and Villa Policies during my stay.
                </li>

                <li>
                  I accept financial responsibility for any damage,
                  penalties or losses caused by me or any member of my
                  group during our stay.
                </li>

                <li>
                  I understand that violation of villa policies may
                  result in immediate eviction, penalties, police action
                  or cancellation of my booking without refund wherever
                  applicable.
                </li>

                <li>
                  I acknowledge that this electronic consent and digital
                  signature shall have the same legal validity as my
                  handwritten signature.
                </li>

              </ul>

            </div>

            <label className="flex items-start gap-3 mt-8">

              <input
                type="checkbox"
                checked={guestDeclaration}
onChange={(e) => setGuestDeclaration(e.target.checked)}
                className="mt-1"
              />

              <span className="text-gray-700">
                I confirm that I have read, understood and accept all
                terms and conditions mentioned in this Guest Consent
                Agreement.
              </span>

            </label>

          </div>

        </section>
                {/* J. DIGITAL SIGNATURE */}

        <section>

          <div className="bg-slate-800 text-white px-5 py-3 rounded-t-lg">

            <h2 className="text-xl font-bold">
              J. DIGITAL SIGNATURE
            </h2>

          </div>

          <div className="border border-t-0 rounded-b-lg p-6">

            <p className="text-gray-700 mb-6">
              By typing your full name below, you acknowledge that your
              electronic signature is legally binding and confirms your
              acceptance of all terms contained in this Guest Consent
              Agreement.
            </p>

            <div className="grid md:grid-cols-2 gap-6">

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Guest Full Name (Digital Signature)
                </label>

                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border p-3"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Date
                </label>

                <input
                  type="date"
                  value={today}
                  readOnly
                  className="w-full rounded-lg border bg-gray-100 p-3"
                />

              </div>

            </div>

            <div className="mt-8 rounded-lg border border-slate-300 bg-slate-50 p-5">

              <h3 className="font-semibold text-slate-700 mb-3">
                Legal Declaration
              </h3>

              <p className="text-gray-700 leading-7">
                I certify that the information provided in this Guest
                Consent Form is true and complete. I have read,
                understood and voluntarily accepted all policies,
                liabilities, financial responsibilities, safety rules
                and terms of stay at The Rain Villa. I understand that
                this electronic signature has the same legal validity
                as my handwritten signature.
              </p>

            </div>

          </div>

        </section>
                {/* ACTION BUTTONS */}

        <div className="border-t pt-8 flex flex-col md:flex-row justify-end gap-4">

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium hover:bg-gray-100"
          >
            Print Copy
          </button>

          <button
            type="button"
            onClick={saveConsent}
            disabled={saving}
            className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Submitting..." : "Submit Consent"}
          </button>

        </div>

      </div>

    </div>

  </main>

</div>

  );
}
                         
        