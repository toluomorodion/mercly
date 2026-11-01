import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { createPaymentLink } from '@/lib/flutterwave';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body?.productId || !body?.buyerEmail) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: 'invalid_input', message: 'Product ID and email are required' } },
        { status: 400 }
      );
    }

    const { productId, buyerEmail } = body;

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { user: true }
    });

    if (!product || product.deletedAt) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: 'not_found', message: 'Product not found' } },
        { status: 404 }
      );
    }

    // Generate unique transaction reference
    const txRef = `SS-${crypto.randomBytes(8).toString('hex')}`;

    // Create pending order
    await db.order.create({
      data: {
        productId,
        buyerEmail,
        amount: product.price,
        status: 'pending',
        transactionReference: txRef,
      }
    });

    // Create payment link on Flutterwave
    const redirectUrl = `${env.NEXTAUTH_URL}/p/${product.uniqueSlug}/success`;
    
    const paymentLink = await createPaymentLink({
      tx_ref: txRef,
      amount: product.price / 100, // Flutterwave expects amount in Naira
      currency: 'NGN',
      redirect_url: redirectUrl,
      customer: {
        email: buyerEmail,
      },
      customizations: {
        title: product.name,
        description: `Payment for ${product.name}`,
        logo: product.imageUrl || undefined,
      }
    });

    return NextResponse.json<ApiResponse<{ paymentLink: string }>>({ 
      ok: true, 
      data: { paymentLink } 
    });
  } catch (error) {
    console.error(`api.orders.post.failed`, error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: 'server_error', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
