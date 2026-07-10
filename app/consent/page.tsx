"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function ConsentPage() {
  

  const [booking, setBooking] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [idType, setIdType] = useState("");
const [idNumber, setIdNumber] = useState("");
const [bookingId, setBookingId] = useState("");
const [adults, setAdults] = useState(1);
const [children, setChildren] = useState(0);
const [vehicleNumber, setVehicleNumber] = useState("");
const [emergencyContact, setEmergencyContact] = useState("");

const [houseRules, setHouseRules] = useState(false);

const [poolRules, setPoolRules] = useState(false);

const [damageRules, setDamageRules] = useState(false);

const [zeroTolerance, setZeroTolerance] = useState(false);

const [liabilityWaiver, setLiabilityWaiver] = useState(false);
const [signature, setSignature] = useState("");
const [today] = useState(
  new Date().toISOString().split("T")[0]
);
useEffect(() => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  setBookingId(params.get("bookingId") || "");
}, []);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) return;

      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnap = await getDoc(bookingRef);

      if (!bookingSnap.exists()) return;

      const bookingData: any = {
  id: bookingSnap.id,
  ...bookingSnap.data(),
};

      setBooking(bookingData);

      const customerSnapshot = await getDocs(
        collection(db, "customers")
      );

      const customerData = customerSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .find(
          (c: any) =>
            c.name?.toLowerCase() ===
            bookingData.customerName?.toLowerCase()
        );

      if (customerData) {
        setCustomer(customerData);
      }
    }

    loadBooking();
  }, [bookingId]);
  async function saveConsent() {
  if (
    !houseRules ||
    !poolRules ||
    !damageRules ||
    !zeroTolerance ||
    !liabilityWaiver
) {
    alert("Please accept all sections before submitting.");
    return;
}

  if (!signature.trim()) {
    alert("Please enter guest signature.");
    return;
  }
  const bookingSnapshot = await getDocs(collection(db, "bookings"));

const bookingNumber = `RV-${String(
  bookingSnapshot.size + 1
).padStart(4, "0")}`;

  await addDoc(collection(db, "consents"), {
    bookingId: booking?.id,
    customerName: booking?.customerName,
    villa: booking?.villa,

    phone: customer?.phone,
    email: customer?.email,

    idType,
    idNumber,

    adults,
    children,
    vehicleNumber,
    emergencyContact,

    signature,

    houseRules,
poolRules,
damageRules,
zeroTolerance,
liabilityWaiver,

    createdAt: new Date(),
  });

  alert("Consent saved successfully.");
}

  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <main className="p-8">

          <div className="mb-8">

            <h1 className="text-3xl font-bold">
              Customer Consent Form
            </h1>

            <p className="text-gray-500 mt-2">
              Review guest details and complete the customer consent form.
            </p>

          </div>

          <div className="bg-white rounded-xl shadow p-8">

            <div className="space-y-10">

              {/* Booking Details */}

              <section>

                <h2 className="text-xl font-semibold border-b pb-2 mb-6">
                  Booking Details
                </h2>

                <div className="grid grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Booking ID
                    </label>

                    <input
                      value={booking?.bookingNumber || ""}
                      readOnly
                      className="w-full border rounded-lg p-3 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Villa
                    </label>

                    <input
                      value={booking?.villa || ""}
                      readOnly
                      className="w-full border rounded-lg p-3 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Check In
                    </label>

                    <input
                      type="date"
                      value={booking?.checkIn || ""}
                      readOnly
                      className="w-full border rounded-lg p-3 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Check Out
                    </label>

                    <input
                      type="date"
                      value={booking?.checkOut || ""}
                      readOnly
                      className="w-full border rounded-lg p-3 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Total Guests
                    </label>

                    <input
                      value={booking?.guests || ""}
                      readOnly
                      className="w-full border rounded-lg p-3 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Booking Status
                    </label>

                    <input
                      value={booking?.status || ""}
                      readOnly
                      className="w-full border rounded-lg p-3 bg-gray-100"
                    />
                  </div>

                </div>

              </section>

              {/* Guest Details */}

              <section>

                <h2 className="text-xl font-semibold border-b pb-2 mb-6">
                  Guest Details
                </h2>

                <div className="grid grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Guest Name
                    </label>

                    <input
                      value={booking?.customerName || ""}
                      readOnly
                      className="w-full border rounded-lg p-3 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mobile Number
                    </label>

                    <input
                      value={customer?.phone || ""}
                      readOnly
                      className="w-full border rounded-lg p-3 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>

                    <input
                      value={customer?.email || ""}
                      readOnly
                      className="w-full border rounded-lg p-3 bg-gray-100"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Address
                    </label>

                    <textarea
                      rows={3}
                      value={customer?.address || ""}
                      readOnly
                      className="w-full border rounded-lg p-3 bg-gray-100 resize-none"
                    />
                  </div>

                </div>

              </section>
              {/* Government ID */}

<section>

  <h2 className="text-xl font-semibold border-b pb-2 mb-6">
    Government ID
  </h2>

  <div className="grid grid-cols-2 gap-5">

    <div>
      <label className="block text-sm font-medium mb-1">
        ID Type
      </label>

      <select
        value={idType}
        onChange={(e) => setIdType(e.target.value)}
        className="w-full border rounded-lg p-3"
      >
        <option value="">Select ID</option>
        <option>Aadhaar Card</option>
        <option>PAN Card</option>
        <option>Passport</option>
        <option>Driving Licence</option>
        <option>Voter ID</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        ID Number
      </label>

      <input
        type="text"
        value={idNumber}
        onChange={(e) => setIdNumber(e.target.value)}
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div className="col-span-2">

      <label className="block text-sm font-medium mb-1">
        Upload ID Proof
      </label>

      <input
        type="file"
        className="w-full border rounded-lg p-3"
      />

    </div>

  </div>

</section>

{/* Guest Stay Details */}

<section>

  <h2 className="text-xl font-semibold border-b pb-2 mb-6">
    Guest Stay Details
  </h2>

  <div className="grid grid-cols-2 gap-5">

    <div>
      <label className="block text-sm font-medium mb-1">
        Adults
      </label>

      <input
        type="number"
        value={adults}
        onChange={(e) => setAdults(Number(e.target.value))}
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Children
      </label>

      <input
        type="number"
        value={children}
        onChange={(e) => setChildren(Number(e.target.value))}
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Vehicle Number
      </label>

      <input
        value={vehicleNumber}
        onChange={(e) => setVehicleNumber(e.target.value)}
        className="w-full border rounded-lg p-3"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Emergency Contact
      </label>

      <input
        value={emergencyContact}
        onChange={(e) => setEmergencyContact(e.target.value)}
        className="w-full border rounded-lg p-3"
      />
    </div>

  </div>

</section>

<section>

<h2 className="text-xl font-semibold border-b pb-2 mb-6">
Acknowledgment of House Rules
</h2>

<div className="space-y-5">

<label className="flex gap-3">
<input
type="checkbox"
checked={houseRules}
onChange={(e)=>setHouseRules(e.target.checked)}
/>

<span>

I have read and understood the House Rules including:

• Pool Rules

• Kitchen Rules

• Bathroom Rules

• Cleanliness

• Quiet Hours

• Registered Guests

• Check-out Policy

</span>

</label>

</div>

</section>
<section>

<h2 className="text-xl font-semibold border-b pb-2 mb-6">
Swimming Pool Liability
</h2>

<div className="space-y-3">

<p>
There is NO lifeguard on duty.
Swimming is entirely at your own risk.
Children must always be supervised.
Glass items are strictly prohibited near the pool.
</p>

<label className="flex gap-3">

<input
type="checkbox"
checked={poolRules}
onChange={(e)=>setPoolRules(e.target.checked)}
/>

<span>
I accept the Swimming Pool Liability.
</span>

</label>

</div>

</section>
<section>

<h2 className="text-xl font-semibold border-b pb-2 mb-6">
Damage Policy
</h2>

<table className="w-full border">

<tbody>

<tr>

<td className="border p-2">
Lost Keys
</td>

<td className="border p-2">
₹500
</td>

</tr>

<tr>

<td className="border p-2">
Broken TV
</td>

<td className="border p-2">
Actual Cost
</td>

</tr>

<tr>

<td className="border p-2">
Late Checkout
</td>

<td className="border p-2">
₹1000/hour
</td>

</tr>

</tbody>

</table>

<label className="flex gap-3 mt-5">

<input
type="checkbox"
checked={damageRules}
onChange={(e)=>setDamageRules(e.target.checked)}
/>

<span>
I agree to the Damage Policy.
</span>

</label>

</section>
<section>

<h2 className="text-xl font-semibold border-b pb-2 mb-6">
Zero Tolerance Policy
</h2>

<ul className="list-disc pl-6">

<li>Illegal Drugs</li>

<li>Weapons</li>

<li>Violence</li>

<li>Smoking Indoors</li>

<li>Hookah</li>

</ul>

<label className="flex gap-3 mt-5">

<input
type="checkbox"
checked={zeroTolerance}
onChange={(e)=>setZeroTolerance(e.target.checked)}
/>

<span>
I understand the Zero Tolerance Policy.
</span>

</label>

</section>
<section>

<h2 className="text-xl font-semibold border-b pb-2 mb-6">
General Liability Waiver
</h2>

<p>

I understand The Rain Villa is not responsible for:

• Personal belongings

• Medical emergencies

• Natural disasters

• Power outages beyond backup facilities

</p>

<label className="flex gap-3 mt-5">

<input
type="checkbox"
checked={liabilityWaiver}
onChange={(e)=>setLiabilityWaiver(e.target.checked)}
/>

<span>
I agree to the Liability Waiver.
</span>

</label>

</section>
{/* Signature */}

<section>

  <h2 className="text-xl font-semibold border-b pb-2 mb-6">
    Guest Signature
  </h2>

  <div className="grid grid-cols-2 gap-5">

    <div>

      <label className="block mb-1 font-medium">
        Guest Signature
      </label>

      <input
        type="text"
        value={signature}
        onChange={(e) => setSignature(e.target.value)}
        placeholder="Type Full Name"
        className="w-full border rounded-lg p-3"
      />

    </div>

    <div>

      <label className="block mb-1 font-medium">
        Date
      </label>

      <input
        type="date"
        value={today}
        readOnly
        className="w-full border rounded-lg p-3 bg-gray-100"
      />

    </div>

  </div>

</section>

{/* Action Buttons */}

<div className="flex justify-end gap-4 pt-8">

  <button
    type="button"
    onClick={() => window.print()}
    className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400"
  >
    Print
  </button>

  <button
    type="button"
    onClick={saveConsent}
    className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
  >
    Save Consent
  </button>

</div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}