import jsPDF from "jspdf";
import { formatFCFA } from "@/lib/utils";

type ContractData = {
  bookingRef: string;
  clientName: string;
  roomNumber: string;
  startDate: string;
  endDate: string;
  monthlyAmount: number;
  depositAmount: number;
};

export function generateContractPdf(data: ContractData) {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text("Contrat de sejour - IvoireSuiteFlow", 14, 20);
  doc.setFontSize(11);
  doc.text(`Reference: ${data.bookingRef}`, 14, 32);
  doc.text(`Client: ${data.clientName}`, 14, 40);
  doc.text(`Logement: ${data.roomNumber}`, 14, 48);
  doc.text(`Periode: ${data.startDate} au ${data.endDate}`, 14, 56);
  doc.text(`Montant mensuel: ${formatFCFA(data.monthlyAmount)}`, 14, 64);
  doc.text(`Caution: ${formatFCFA(data.depositAmount)}`, 14, 72);
  doc.text("Ce contrat est genere automatiquement par IvoireSuiteFlow.", 14, 86);
  return doc;
}
