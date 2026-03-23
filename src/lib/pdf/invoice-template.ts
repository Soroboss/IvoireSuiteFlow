import jsPDF from "jspdf";
import { formatFCFA } from "@/lib/utils";

type InvoiceData = {
  bookingRef: string;
  clientName: string;
  roomNumber: string;
  mode: string;
  checkIn: string;
  checkOut: string;
  total: number;
};

export function generateInvoicePdf(data: InvoiceData) {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text("IvoireSuiteFlow - Facture", 14, 20);
  doc.setFontSize(11);
  doc.text(`Reference: ${data.bookingRef}`, 14, 32);
  doc.text(`Client: ${data.clientName}`, 14, 40);
  doc.text(`Logement: ${data.roomNumber}`, 14, 48);
  doc.text(`Mode: ${data.mode}`, 14, 56);
  doc.text(`Check-in: ${data.checkIn}`, 14, 64);
  doc.text(`Fin: ${data.checkOut}`, 14, 72);
  doc.setFontSize(14);
  doc.text(`TOTAL: ${formatFCFA(data.total)}`, 14, 86);
  return doc;
}

export function downloadInvoicePdf(data: InvoiceData) {
  const doc = generateInvoicePdf(data);
  doc.save(`facture-${data.bookingRef}.pdf`);
}
