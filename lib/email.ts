import { Resend } from 'resend';
import { env } from '@/lib/env';

const resend = new Resend(env.RESEND_API_KEY || 're_mock123');
// Set this to your verified domain in Resend.
// For now we use a generic placeholder or the Resend testing domain.
const fromEmail = 'Mercly <onboarding@resend.dev>';

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset your Mercly password',
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
};

export const sendPaymentConfirmationEmail = async (email: string, orderDetails: any) => {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `New Order: ${orderDetails.productName}`,
      html: `
        <h2>You have a new order!</h2>
        <p><strong>Product:</strong> ${orderDetails.productName}</p>
        <p><strong>Amount:</strong> ₦${(orderDetails.amount / 100).toFixed(2)}</p>
        <p><strong>Buyer Email:</strong> ${orderDetails.buyerEmail}</p>
        <p><strong>Transaction Ref:</strong> ${orderDetails.transactionReference}</p>
        <p>Log in to your Mercly dashboard to view more details.</p>
      `,
    });
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
  }
};
