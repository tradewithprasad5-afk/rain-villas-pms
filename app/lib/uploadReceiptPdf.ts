import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadReceiptPdf(
  pdfBlob: Blob,
  bookingNumber: string
) {
  const fileName = `receipts/Receipt-${bookingNumber}-${Date.now()}.pdf`;

  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, pdfBlob);

  return await getDownloadURL(storageRef);
}