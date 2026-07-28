import { generateBackupWorkbookBuffer } from "@/app/lib/generateBackupWorkbook";
import { saveAs } from "file-saver";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

function bufferToBase64(buffer: ArrayBuffer | Uint8Array) {
  const bytes =
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  let binary = "";
  const chunkSize = 8192;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

export async function downloadBusinessBackup() {
  alert("Button clicked — starting backup..."); // DEBUG

  try {
    alert(
      "Is native platform? " + Capacitor.isNativePlatform()
    ); // DEBUG

    const buffer = await generateBackupWorkbookBuffer();

    alert("Workbook generated, size: " + buffer.length); // DEBUG

    const now = new Date();

    const filename = `RainVillas_Business_Backup_${
      now.toISOString().split("T")[0]
    }.xlsx`;

    if (Capacitor.isNativePlatform()) {
      alert("Taking native path..."); // DEBUG

      const base64Data = bufferToBase64(buffer);

      alert("Base64 conversion done, writing file..."); // DEBUG

      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
      });

      alert("File written to: " + writeResult.uri); // DEBUG

      await Share.share({
        title: "Rain Villa Business Backup",
        text: "Business backup export",
        url: writeResult.uri,
        dialogTitle: "Save or share backup",
      });

      alert("Share sheet should have opened"); // DEBUG
    } else {
      alert("Taking web path..."); // DEBUG

      const blob = new Blob([new Uint8Array(buffer)], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, filename);
    }
  } catch (error) {
    console.error("Business backup failed:", error);
    alert("ERROR: " + String(error)); // DEBUG - shows the real error
  }
}