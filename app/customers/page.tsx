"use client";


import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import * as XLSX from "xlsx";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  async function loadCustomers() {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "customers"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function deleteCustomer(id: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "customers", id));

      setCustomers((prev) =>
        prev.filter((customer) => customer.id !== id)
      );

      alert("Customer deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to delete customer.");
    }
  }

  function exportCustomers() {
    const exportData = customers.map((customer) => ({
      Customer: customer.name,
      Phone: customer.phone,
      Email: customer.email || "",
      "Total Bookings": customer.totalBookings || 0,
      "Last Stay": customer.lastStay || "",
      "Total Spent (₹)": customer.totalSpent || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Customers"
    );

    XLSX.writeFile(
      workbook,
      `RainVilla_Customers_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
  }

 return (
  <main className="space-y-6 p-4 sm:p-6 lg:p-8">

    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Customers
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Customer Directory
        </p>
      </div>

      <button
        onClick={exportCustomers}
        className="w-full rounded-xl bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700 sm:w-auto"
      >
        Export Excel
      </button>

    </div>

    <>
  <div className="space-y-4 md:hidden">
  {loading ? (
    <div className="rounded-xl bg-white p-6 text-center shadow">
      Loading customers...
    </div>
  ) : customers.length === 0 ? (
    <div className="rounded-xl bg-white p-6 text-center shadow">
      No customers found.
    </div>
  ) : (
    customers.map((customer) => (
      <div
        key={customer.id}
        className="rounded-xl border bg-white p-4 shadow"
      >
        <h3 className="text-lg font-semibold">
          {customer.name}
        </h3>

        <div className="mt-3 space-y-2 text-sm">

          <div className="flex justify-between">
            <span className="text-gray-500">Phone</span>
            <span>{customer.phone}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span>{customer.email || "-"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Bookings</span>
            <span>{customer.totalBookings || 0}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Last Stay</span>
            <span>{customer.lastStay || "-"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Total Spent</span>
            <span className="font-semibold text-green-700">
              ₹{(customer.totalSpent || 0).toLocaleString()}
            </span>
          </div>

        </div>

        <button
          onClick={() => deleteCustomer(customer.id)}
          className="mt-4 w-full rounded-lg bg-red-600 py-2 text-white hover:bg-red-700"
        >
          Delete
        </button>

      </div>
    ))
  )}
</div>
  {/* Desktop */}
  <div className="hidden md:block w-full overflow-x-auto rounded-xl bg-white shadow">
  <table className="min-w-[1000px] w-full">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-2 py-3 text-left text-sm md:px-4 md:py-4">
          Customer
        </th>
        <th className="px-2 py-3 text-left text-sm md:px-4 md:py-4">
          Phone
        </th>
        <th className="px-2 py-3 text-left text-sm md:px-4 md:py-4">
          Email
        </th>
        <th className="px-2 py-3 text-center text-sm md:px-4 md:py-4">
          Bookings
        </th>
        <th className="px-2 py-3 text-center text-sm md:px-4 md:py-4">
          Last Stay
        </th>
        <th className="px-2 py-3 text-right text-sm md:px-4 md:py-4">
          Total Spent
        </th>
        <th className="px-2 py-3 text-center text-sm md:px-4 md:py-4">
          Actions
        </th>
      </tr>
    </thead>

    <tbody>
      {loading ? (
        <tr>
          <td
            colSpan={7}
            className="py-12 text-center text-gray-500"
          >
            Loading customers...
          </td>
        </tr>
      ) : customers.length === 0 ? (
        <tr>
          <td
            colSpan={7}
            className="py-12 text-center text-gray-500"
          >
            No customers found.
          </td>
        </tr>
      ) : (
        customers.map((customer) => (
          <tr
            key={customer.id}
            className="border-t hover:bg-gray-50"
          >
            <td className="px-2 py-3 text-sm font-semibold md:px-4 md:py-4">
              {customer.name}
            </td>

            <td className="px-2 py-3 text-sm md:px-4 md:py-4">
              {customer.phone}
            </td>

            <td className="px-2 py-3 text-sm md:px-4 md:py-4">
              {customer.email || "-"}
            </td>

            <td className="px-2 py-3 text-center text-sm md:px-4 md:py-4">
              {customer.totalBookings || 0}
            </td>

            <td className="px-2 py-3 text-center text-sm md:px-4 md:py-4">
              {customer.lastStay || "-"}
            </td>

            <td className="px-2 py-3 text-right text-sm font-semibold text-green-700 md:px-4 md:py-4">
              ₹{(customer.totalSpent || 0).toLocaleString()}
            </td>

            <td className="px-2 py-3 text-center md:px-4 md:py-4">
              <button
                onClick={() => deleteCustomer(customer.id)}
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700 md:px-4 md:text-sm"
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
  
</>

  </main>
);
}