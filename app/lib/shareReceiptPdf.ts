import { Share } from "@capacitor/share";

export async function shareReceiptPdf(
  fileUri: string,
  fileName: string
) {
  await Share.share({
    title: "Rain Villa Receipt",
    text: "Please find your booking receipt attached.",
    url: fileUri,
    dialogTitle: "Share Receipt",
  });
}