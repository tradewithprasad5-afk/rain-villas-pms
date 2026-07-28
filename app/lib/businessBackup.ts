import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import ExcelJS from "exceljs";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const HEADER_FILL = "2563EB";
const BORDER_COLOR = "D1D5DB";

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: BORDER_COLOR } },
  left: { style: "thin", color: { argb: BORDER_COLOR } },
  bottom: { style: "thin", color: { argb: BORDER_COLOR } },
  right: { style: "thin", color: { argb: BORDER_COLOR } },
};

function styleHeaderRow(sheet: ExcelJS.Worksheet) {
  const headerRow = sheet.getRow(1);

  headerRow.height = 22;

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_FILL },
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = THIN_BORDER;
  });

  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columnCount },
  };
}

function styleDataRows(sheet: ExcelJS.Worksheet) {
  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = THIN_BORDER;
      cell.alignment = { vertical: "middle" };
    });

    if (i % 2 === 0) {
      row.eachCell({ includeEmpty: true }, (cell) => {
        if (!cell.fill || cell.fill.type !== "pattern") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F8FAFC" },
          };
        }
      });
    }
  }
}

function applyCurrencyFormat(sheet: ExcelJS.Worksheet, keys: string[]) {
  keys.forEach((key) => {
    const column = sheet.getColumn(key);
    column.numFmt = "₹#,##0";
    column.alignment = { horizontal: "right" };
  });
}

function colorStatusColumn(
  sheet: ExcelJS.Worksheet,
  key: string,
  positiveValues: string[]
) {
  const column = sheet.getColumn(key);

  column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
    if (rowNumber === 1) return;

    const value = String(cell.value || "");
    const isPositive = positiveValues.includes(value);

    cell.font = {
      bold: true,
      color: { argb: isPositive ? "FF15803D" : "FFB91C1C" },
    };
  });
}

  export async function downloadBusinessBackup() {
  alert("Backup function started");

  
  try {
    // Read Firestore collections
    const bookingsSnapshot = await getDocs(collection(db, "bookings"));
    const paymentsSnapshot = await getDocs(collection(db, "payments"));

    const bookings = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const payments = paymentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
   // Read customers collection
const customersSnapshot = await getDocs(collection(db, "customers"));

const customers = customersSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

// Create customer phone lookup
const customerPhoneMap = new Map(
  customers.map((customer: any) => [
    String(customer.name || "").trim().toLowerCase(),
    customer.phone || "",
  ])
);

    // Create workbook
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Rain Villa PMS";
    workbook.created = new Date();

    // Create worksheets
    // Create worksheets
const summarySheet = workbook.addWorksheet("Summary");
const bookingsSheet = workbook.addWorksheet("Bookings");
const paymentsSheet = workbook.addWorksheet("Payments");
const revenueSheet = workbook.addWorksheet("Revenue Report");

// ======================
// Summary Sheet
// ======================

summarySheet.columns = [
  { header: "Sr No", key: "srNo", width: 10 },
  { header: "Field", key: "field", width: 35 },
  { header: "Value", key: "value", width: 30 },
];

const totalRevenue = bookings.reduce(
  (sum: number, booking: any) => sum + Number(booking.totalAmount || 0),
  0
);

const advanceReceived = bookings.reduce(
  (sum: number, booking: any) => sum + Number(booking.advancePaid || 0),
  0
);

const pendingBalance = bookings.reduce(
  (sum: number, booking: any) => sum + Number(booking.balanceAmount || 0),
  0
);

const confirmedBookings = bookings.filter(
  (booking: any) => booking.status === "Confirmed"
).length;

summarySheet.addRows([
  { srNo: 1, field: "Backup Generated", value: new Date().toLocaleString() },
  { srNo: 2, field: "Total Bookings", value: bookings.length },
  { srNo: 3, field: "Confirmed Bookings", value: confirmedBookings },
  { srNo: 4, field: "Payment Summary Records", value: bookings.length },
  { srNo: 5, field: "Payment Transactions", value: payments.length },
  { srNo: 6, field: "Total Revenue", value: totalRevenue },
  { srNo: 7, field: "Advance Received", value: advanceReceived },
  { srNo: 8, field: "Pending Balance", value: pendingBalance },
]);

styleHeaderRow(summarySheet);
styleDataRows(summarySheet);
  
// ======================
// Bookings Sheet
// ======================

bookingsSheet.columns = [
  { header: "Sr No", key: "srNo", width: 10 },
  { header: "Booking No", key: "bookingNumber", width: 18 },
  { header: "Guest Name", key: "customerName", width: 30 },
  { header: "Phone", key: "phone", width: 18 },
  { header: "Villa", key: "villa", width: 20 },
  { header: "Check In", key: "checkIn", width: 15 },
  { header: "Check Out", key: "checkOut", width: 15 },
  { header: "Adults", key: "adults", width: 10 },
  { header: "Children", key: "children", width: 10 },
  { header: "Status", key: "status", width: 15 },
  { header: "Total Amount", key: "totalAmount", width: 18 },
  { header: "Advance Paid", key: "advancePaid", width: 18 },
  { header: "Balance Amount", key: "balanceAmount", width: 18 },
];

bookings.forEach((booking: any, index: number) => {
    const phone =
  customerPhoneMap.get(
    String(booking.customerName || "").trim().toLowerCase()
  ) || "";
  bookingsSheet.addRow({
    srNo: index + 1,
    bookingNumber: booking.bookingNumber || "",
    customerName: booking.customerName || "",
    phone: "'" + phone,
    villa: booking.villa || "",
    checkIn: booking.checkIn || "",
    checkOut: booking.checkOut || "",
    adults: booking.adults || 0,
    children: booking.children || 0,
    status: booking.status || "",
    totalAmount: booking.totalAmount || 0,
    advancePaid: booking.advancePaid || 0,
    balanceAmount: booking.balanceAmount || 0,
  });
  // Format Phone column as Text

});
bookingsSheet.getColumn("phone").numFmt = "@";

applyCurrencyFormat(bookingsSheet, [
  "totalAmount",
  "advancePaid",
  "balanceAmount",
]);
colorStatusColumn(bookingsSheet, "status", ["Confirmed"]);
styleHeaderRow(bookingsSheet);
styleDataRows(bookingsSheet);
// ======================
// Payments Sheet
// ======================

paymentsSheet.columns = [
  { header: "Sr No", key: "srNo", width: 10 },
  { header: "Booking No", key: "bookingNumber", width: 18 },
  { header: "Guest Name", key: "customerName", width: 30 },
  { header: "Phone", key: "phone", width: 18 },
  { header: "Total Amount", key: "totalAmount", width: 18 },
  { header: "Advance Paid", key: "advancePaid", width: 18 },
  { header: "Balance Amount", key: "balanceAmount", width: 18 },
  { header: "Payment Status", key: "paymentStatus", width: 20 },
];

bookings.forEach((booking: any, index: number) => {
    const phone =
  customerPhoneMap.get(
    String(booking.customerName || "").trim().toLowerCase()
  ) || "";
  paymentsSheet.addRow({
    srNo: index + 1,
    bookingNumber: booking.bookingNumber || "",
    customerName: booking.customerName || "",
    phone: "'" + phone,
    totalAmount: booking.totalAmount || 0,
    advancePaid: booking.advancePaid || 0,
    balanceAmount: booking.balanceAmount || 0,
    paymentStatus:
      Number(booking.balanceAmount || 0) > 0
        ? "Balance Pending"
        : "Paid",
  });
  
  
});

paymentsSheet.getColumn("phone").numFmt = "@";

applyCurrencyFormat(paymentsSheet, [
  "totalAmount",
  "advancePaid",
  "balanceAmount",
]);
colorStatusColumn(paymentsSheet, "paymentStatus", ["Paid"]);
styleHeaderRow(paymentsSheet);
styleDataRows(paymentsSheet);
// ======================
// Revenue Report Sheet
// ======================

revenueSheet.columns = [
  { header: "Sr No", key: "srNo", width: 10 },
  { header: "Description", key: "description", width: 35 },
  { header: "Amount", key: "amount", width: 20 },
];

revenueSheet.addRows([
  {
    srNo: 1,
    description: "Total Revenue",
    amount: totalRevenue,
  },
  {
    srNo: 2,
    description: "Advance Received",
    amount: advanceReceived,
  },
  {
    srNo: 3,
    description: "Pending Balance",
    amount: pendingBalance,
  },
]);

applyCurrencyFormat(revenueSheet, ["amount"]);
styleHeaderRow(revenueSheet);
styleDataRows(revenueSheet);
    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();

const now = new Date();

const filename = `RainVillas_Business_Backup_${
  now.toISOString().split("T")[0]
}.xlsx`;

if (Capacitor.getPlatform() === "web") {
  const blob = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
} else {
  // Convert workbook to Base64
  const bytes = new Uint8Array(buffer);

  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });

  const base64 = btoa(binary);

  const result = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Documents,
  });

  await Share.share({
    title: "Business Backup",
    text: "Rain Villa PMS Business Backup",
    url: result.uri,
    dialogTitle: "Save or Share Backup",
  });
}

console.log(
  `Backup exported (${bookings.length} bookings, ${payments.length} payments)`
);
  } 
  catch (error: any) {
  console.error("Business backup failed:", error);

  alert(
    error?.message ||
    JSON.stringify(error) ||
    String(error)
  );
}
}