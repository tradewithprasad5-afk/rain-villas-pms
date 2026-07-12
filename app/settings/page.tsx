"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface SettingsData {
  companyName: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  terms: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<SettingsData>({
    companyName: "",
    logo: "",
    address: "",
    phone: "",
    email: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
    terms: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const ref = doc(db, "settings", "company");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSettings(snap.data() as SettingsData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);

    try {
      await setDoc(doc(db, "settings", "company"), settings);

      alert("Settings saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        Settings
      </h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">

        <h2 className="text-xl font-semibold mb-6">
          Company Information
        </h2>

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="block mb-2 font-medium">
              Company Name
            </label>

            <input
              type="text"
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
  <label className="block mb-2 font-medium">
    Logo URL
  </label>

  <input
    type="text"
    name="logo"
    value={settings.logo}
    onChange={handleChange}
    className="w-full border rounded-lg px-3 py-2"
  />

  {settings.logo && (
    <img
      src={settings.logo}
      alt="Company Logo"
      className="mt-3 h-20 w-auto rounded border"
    />
  )}
</div>

          <div>
            <label className="block mb-2 font-medium">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

        </div>

        <div className="mt-5">

          <label className="block mb-2 font-medium">
            Address
          </label>

          <textarea
            rows={3}
            name="address"
            value={settings.address}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

      </div>
            <div className="bg-white rounded-xl shadow p-6 mb-8">

        <h2 className="text-xl font-semibold mb-6">
          Bank Details
        </h2>

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="block mb-2 font-medium">
              Bank Name
            </label>

            <input
              type="text"
              name="bankName"
              value={settings.bankName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Account Number
            </label>

            <input
              type="text"
              name="accountNumber"
              value={settings.accountNumber}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              IFSC Code
            </label>

            <input
              type="text"
              name="ifsc"
              value={settings.ifsc}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              UPI ID
            </label>

            <input
              type="text"
              name="upiId"
              value={settings.upiId}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">

        <h2 className="text-xl font-semibold mb-6">
          Terms & Conditions
        </h2>

        <textarea
          rows={10}
          name="terms"
          value={settings.terms}
          onChange={handleChange}
          placeholder="Enter your booking terms and conditions..."
          className="w-full border rounded-lg px-3 py-2"
        />

      </div>

      <div className="flex justify-end">

        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>

      </div>

    </div>
  );
}