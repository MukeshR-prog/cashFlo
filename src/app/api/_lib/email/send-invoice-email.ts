import nodemailer from "nodemailer";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface SendInvoiceEmailParams {
  to: string;
  clientName: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  totalAmount: number;
  paymentLink?: string;
  notes?: string;
  freelancerName?: string;
}

function buildHtml(params: SendInvoiceEmailParams): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const itemRows = params.items
    .map(
      (item) => `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 12px;font-size:13px;color:#374151;">${item.description}</td>
          <td style="padding:10px 12px;text-align:center;font-size:13px;color:#374151;">${item.quantity}</td>
          <td style="padding:10px 12px;text-align:right;font-size:13px;color:#374151;">${fmt(item.unitPrice)}</td>
          <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:600;color:#111827;">${fmt(item.amount)}</td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:620px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 36px;">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">cashFlo</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#e0e7ff;opacity:0.9;">Professional Invoice</p>
    </div>

    <!-- Body -->
    <div style="padding:36px;">
      <p style="margin:0 0 8px;font-size:15px;color:#374151;">Hi <strong>${params.clientName}</strong>,</p>
      <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
        ${params.freelancerName ?? "Your service provider"} has sent you an invoice. Please find the details below.
      </p>

      <!-- Invoice Meta -->
      <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:28px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Invoice Number</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#6366f1;">${params.invoiceNumber}</p>
        </div>
        <div>
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Issue Date</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#374151;">${fmtDate(params.issueDate)}</p>
        </div>
        <div>
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Due Date</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#ef4444;">${fmtDate(params.dueDate)}</p>
        </div>
      </div>

      <!-- Items Table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;font-weight:600;">Description</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;font-weight:600;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;font-weight:600;">Rate</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;font-weight:600;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Total -->
      <div style="border-top:2px solid #e5e7eb;padding-top:16px;text-align:right;margin-bottom:28px;">
        <p style="margin:0;font-size:22px;font-weight:800;color:#111827;">
          Total: ${fmt(params.totalAmount)}
        </p>
      </div>

      ${
        params.paymentLink
          ? `<!-- Pay Now Button -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${params.paymentLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.02em;">
          Pay Now
        </a>
        <p style="margin:10px 0 0;font-size:11px;color:#9ca3af;">Or copy this link: <span style="color:#6366f1;">${params.paymentLink}</span></p>
      </div>`
          : ""
      }

      ${
        params.notes
          ? `<div style="background:#faf5ff;border-left:3px solid #8b5cf6;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;"><strong style="color:#374151;">Note:</strong> ${params.notes}</p>
      </div>`
          : ""
      }

      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
        Questions? Reply to this email or contact your service provider.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:20px 36px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;color:#d1d5db;">Powered by <strong>cashFlo</strong> · Unified Payment Dashboard</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const from = process.env.SMTP_FROM ?? `CashFlo <${user}>`;

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env.local");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: params.to,
    subject: `Invoice ${params.invoiceNumber} from ${params.freelancerName ?? "cashFlo"}`,
    html: buildHtml(params),
  });
}
