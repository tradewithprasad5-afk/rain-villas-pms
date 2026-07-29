import { Share } from "@capacitor/share";

export async function shareReceiptPdf(
  fileUri: string,
  fileName: string
) {
  await Share.share({
    title: "Rain Villa Receipt",
    text: `Dear Guest,

Thank you for choosing Rain Villa.

Please find your booking receipt attached.

Regards,
Rain Villa
📞 9527249988
🌐 www.rainvilla.in`,
    url: fileUri,
    dialogTitle: "Share Receipt",
  });
}