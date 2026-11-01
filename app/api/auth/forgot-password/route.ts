import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/validators/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: 'invalid_input', message: 'Check your input and try again.' } },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.json<ApiResponse>({ ok: true });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiration

    // Save token
    await db.passwordResetToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id
      }
    });

    // Send email
    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json<ApiResponse>({ ok: true });
  } catch (error) {
    console.error(`api.auth.forgot-password.failed`, error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: 'server_error', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
