"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { FaEdit, FaTrash } from "react-icons/fa";


export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);

const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [editingId, setEditingId] = useState<string | null>(null);
    async function loadCustomers() {
        
  const snapshot = await getDocs(collection(db, "customers"));

  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  setCustomers(data);
}
async function saveCustomer() {
  const newCustomer = {
    name,
    phone,
    email,
  };

 if (editingId) {
  await updateDoc(doc(db, "customers", editingId), newCustomer);
} else {
  await addDoc(collection(db, "customers"), newCustomer);
}

  await loadCustomers();

  setName("");
  setPhone("");
  setEmail("");
  setEditingId(null);
  setShowForm(false);
}
async function deleteCustomer(id: string) {
  if (!confirm("Delete this customer?")) return;

  await deleteDoc(doc(db, "customers", id));

  await loadCustomers();
}
useEffect(() => {
  loadCustomers();
}, []);
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
  <h1 className="text-3xl font-bold">
    Customers
  </h1>

  <button
  onClick={() => setShowForm(true)}
  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
>
  + New Customer
</button>
</div>
          <div className="bg-white rounded-xl shadow overflow-hidden">
  <table className="w-full">
    <thead className="bg-gray-100">
      <tr>
        <th className="text-left p-4">Name</th>
        <th className="text-left p-4">Phone</th>
        <th className="text-left p-4">Email</th>
        <th className="text-left p-4">Actions</th>
      </tr>
    </thead>

    <tbody>
      {customers.map((customer) => (
       <tr key={customer.id} className="border-b">
  <td className="p-4">{customer.name}</td>
  <td className="p-4">{customer.phone}</td>
  <td className="p-4">{customer.email}</td>

  <td className="p-4">
    <div className="flex gap-3">
      <button
  onClick={() => {
    setEditingId(customer.id);
    setName(customer.name);
    setPhone(customer.phone);
    setEmail(customer.email);
    setShowForm(true);
  }}
  className="text-blue-600 hover:text-blue-800"
>
  <FaEdit />
</button>

      <button
  onClick={() => deleteCustomer(customer.id)}
  className="text-red-600 hover:text-red-800"
>
  <FaTrash />
</button>
    </div>
  </td>
</tr>
      ))}
    </tbody>
  </table>
</div>
{showForm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-8 w-[500px] shadow-xl">

      <h2 className="text-2xl font-bold mb-4">
        New Customer
      </h2>

      <div className="space-y-4">

        <div>
          <label className="block mb-1 font-medium">
            Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Phone
          </label>

          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setShowForm(false)}
          className="px-5 py-2 rounded-lg bg-gray-300"
        >
          Cancel
        </button>

        <button
  onClick={saveCustomer}
  className="px-5 py-2 rounded-lg bg-green-600 text-white"
>
  Save Customer
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