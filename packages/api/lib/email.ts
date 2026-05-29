import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_for_build");

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return;
  }

  try {
    const fromAddress = process.env.RESEND_FROM_EMAIL || "Postcard Platform <notifications@yourdomain.com>";
    await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export const emailTemplates = {
  paymentReceived: (campaignName: string, amount: number) => ({
    subject: `Payment received for ${campaignName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Successful</h2>
        <p>We've received your payment of <strong>$${amount}</strong> for the campaign <strong>${campaignName}</strong>.</p>
        <p>Your postcards are now in production. You'll receive another email when they ship with tracking information.</p>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          Thanks for using Postcard Platform.
        </p>
      </div>
    `,
  }),

  jobShipped: (campaignName: string, trackingNumber: string) => ({
    subject: `Your postcards for ${campaignName} have shipped!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your postcards are on the way!</h2>
        <p>Good news — the postcards for <strong>${campaignName}</strong> have been shipped.</p>
        <p><strong>Tracking number:</strong> ${trackingNumber}</p>
        <p>You can track your shipment using the link below or on your Postcard Platform dashboard.</p>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          Thanks for using Postcard Platform.
        </p>
      </div>
    `,
  }),

  proofReviewed: (campaignName: string, approved: boolean, notes?: string) => ({
    subject: `Proof ${approved ? "Approved" : "Needs Changes"} for ${campaignName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Proof ${approved ? "Approved" : "Needs Revision"}</h2>
        <p>The proof for your campaign <strong>${campaignName}</strong> has been ${approved ? "approved" : "reviewed and needs changes"}.</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
        <p>You can track progress in your dashboard.</p>
      </div>
    `,
  }),

  artworkRejected: (campaignName: string, notes?: string) => ({
    subject: `Action needed: Artwork for ${campaignName} needs revision`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Artwork Needs Revision</h2>
        <p>Our team reviewed the artwork for <strong>${campaignName}</strong> and found it needs some changes before we can proceed to print.</p>
        ${notes ? `<p><strong>Notes from our team:</strong><br>${notes}</p>` : ''}
        <p>Please log into your Postcard Platform account, update your artwork, and resubmit.</p>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          Thanks,<br>
          The Postcard Platform Team
        </p>
      </div>
    `,
  }),
};
