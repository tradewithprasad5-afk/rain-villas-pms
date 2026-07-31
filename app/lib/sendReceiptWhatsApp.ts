import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function sendReceiptWhatsApp(booking: any) {
  try {
    if (!booking.customerId) {
      alert("Customer not found.");
      return;
    }

    // Get customer details
    const customerRef = doc(db, "customers", booking.customerId);
    const customerSnap = await getDoc(customerRef);

    if (!customerSnap.exists()) {
      alert("Customer record not found.");
      return;
    }

    const customer = customerSnap.data();

    const phone = (customer.phone || "").replace(/\D/g, "");

    if (!phone) {
      alert("Customer phone number not found.");
      return;
    }

    const receiptUrl = `${window.location.origin}/receipt/${booking.id}`;

    const message = `Dear ${booking.customerName},

Thank you for choosing Rain Villa 🌿

Please find your booking receipt below.

Booking No: ${booking.bookingNumber}

${receiptUrl}

Regards,
Rain Villa`;

    window.open(
      `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  } catch (error) {
    console.error(error);
    alert("Unable to send WhatsApp.");
  }
}