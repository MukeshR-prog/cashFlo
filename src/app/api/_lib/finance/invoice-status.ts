import type { InvoiceStatus } from "@/app/api/_lib/models/Invoice";

export function resolveInvoiceStatus(amountDue: number, dueDate: Date): InvoiceStatus {
  if (amountDue <= 0) {
    return "paid";
  }

  const now = new Date();
  if (amountDue > 0 && amountDue !== Number.POSITIVE_INFINITY) {
    if (dueDate.getTime() < now.getTime()) {
      return "overdue";
    }
    return "due";
  }

  return "sent";
}

export function resolveInvoiceStatusAfterPayment(
  totalAmount: number,
  amountPaid: number,
  dueDate: Date
): InvoiceStatus {
  const amountDue = Math.max(0, totalAmount - amountPaid);
  if (amountDue <= 0) {
    return "paid";
  }
  if (amountPaid > 0) {
    return "partially_paid";
  }
  return resolveInvoiceStatus(amountDue, dueDate);
}
