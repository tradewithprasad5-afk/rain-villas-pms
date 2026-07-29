import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

function cropCanvas(
  source: HTMLCanvasElement,
  topPx: number,
  heightPx: number
) {
  const cropped = document.createElement("canvas");
  cropped.width = source.width;
  cropped.height = heightPx;

  const ctx = cropped.getContext("2d")!;
  ctx.drawImage(
    source,
    0,
    topPx,
    source.width,
    heightPx,
    0,
    0,
    source.width,
    heightPx
  );

  return cropped;
}

export async function generateReceiptPdfBlob(
  element: HTMLElement
): Promise<Blob> {
  const scale = 2;

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();

  // mm-per-canvas-pixel, based on the image filling the page width
  const pxToMm = pageWidthMm / canvas.width;
  const pageHeightPx = pageHeightMm / pxToMm;

  // Collect the bottom edge (in canvas pixel space) of every
  // section marked data-receipt-block — these are the only points
  // where a page break is allowed to happen, so a card never gets
  // cut in half.
  const elementRect = element.getBoundingClientRect();

  const breakPointsPx = Array.from(
    element.querySelectorAll<HTMLElement>("[data-receipt-block]")
  )
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return (rect.bottom - elementRect.top) * scale;
    })
    .sort((a, b) => a - b);

  breakPointsPx.push(canvas.height);

  let cursorPx = 0;
  let isFirstPage = true;

  while (cursorPx < canvas.height - 1) {
    const idealEndPx = cursorPx + pageHeightPx;

    // Furthest safe break point that still fits within one page.
    let endPx = 0;
    for (const bp of breakPointsPx) {
      if (bp > cursorPx && bp <= idealEndPx) {
        endPx = bp;
      }
    }

    // If no safe break point fits (a single block taller than a
    // full page), fall back to a hard cut so we don't get stuck.
    if (endPx <= cursorPx) {
      endPx = Math.min(idealEndPx, canvas.height);
    }

    const sliceHeightPx = Math.ceil(endPx - cursorPx);
    const sliceCanvas = cropCanvas(canvas, cursorPx, sliceHeightPx);
    const sliceImgData = sliceCanvas.toDataURL("image/jpeg", 1);
    const sliceHeightMm = sliceHeightPx * pxToMm;

    if (!isFirstPage) pdf.addPage();
    isFirstPage = false;

    pdf.addImage(
      sliceImgData,
      "JPEG",
      0,
      0,
      pageWidthMm,
      sliceHeightMm
    );

    cursorPx = endPx;
  }

  return pdf.output("blob");
}