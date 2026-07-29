import { Filesystem, Directory } from "@capacitor/filesystem";

export async function saveReceiptPdf(
  pdfBlob: Blob,
  fileName: string
): Promise<string> {
  const base64 = await blobToBase64(pdfBlob);

  const result = await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Cache,
    recursive: true,
  });

  return result.uri;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}