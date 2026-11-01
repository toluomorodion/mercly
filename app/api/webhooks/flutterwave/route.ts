import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { verifyTransaction } from '@/lib/flutterwave';
import { sendPaymentConfirmationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('verif-hash');
    
    if (!signature || signature !== env.FLW_SECRET_HASH) {
      return NextResponse.json({ ok: false, message: 'Invalid signature' }, { status: 401 });
    }

    const payload = await req.json();

    // Verify event is successful payment
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      const transactionId = payload.data.id;
      
      // Secondary verification via API (Mandatory for security)
      const verifiedData = await verifyTransaction(transactionId);
      
      if (verifiedData.status === 'successful' && verifiedData.currency === 'NGN') {
        const txRef = verifiedData.tx_ref;
        
        // Find the pending order
        const order = await db.order.findUnique({
          where: { transactionReference: txRef }
        });

        if (!order) {
          console.error(`Webhook received for unknown order: ${txRef}`);
          return NextResponse.json({ ok: true }); // Return 200 so FLW stops retrying
        }

        if (order.status === 'paid') {
          // Already paid, ignore duplicate webhook
          return NextResponse.json({ ok: true });
        }

        // Check if amount matches exactly
        // VerifiedData amount is in Naira, order amount is in kobo
        const verifiedAmountKobo = Math.round(verifiedData.amount * 100);
        
        if (verifiedAmountKobo >= order.amount) {
          // Process payment in a transaction
          await db.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: { status: 'paid' }
            });

            await tx.payment.create({
              data: {
                orderId: order.id,
                gatewayReference: String(transactionId),
                status: 'successful',
                paidAt: new Date(verifiedData.created_at)
              }
            });
          });

          // Phase 8: Send email notification to seller
          try {
            const product = await db.product.findUnique({
              where: { id: order.productId },
              include: { user: true }
            });
            if (product?.user.email) {
              await sendPaymentConfirmationEmail(product.user.email, {
                productName: product.name,
                amount: order.amount,
                buyerEmail: order.buyerEmail,
                transactionReference: order.transactionReference,
              });
            }
          } catch (emailError) {
            console.error('Failed to send seller notification email:', emailError);
          }
          console.log(`Order ${order.id} paid successfully.`);
        } else {
          console.error(`Amount mismatch for order ${order.id}. Expected ${order.amount}, got ${verifiedAmountKobo}`);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`api.webhooks.flutterwave.failed`, error);
    // Return 200 even on error to prevent FLW from disabling the webhook
    return NextResponse.json({ ok: true });
  }
}
