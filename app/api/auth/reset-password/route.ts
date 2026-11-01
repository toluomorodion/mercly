import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { resetPasswordSchema } from '@/lib/validators/auth';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: 'invalid_input', message: 'Check your input and try again.' } },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: 'invalid_token', message: 'Token is invalid or has expired.' } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and delete token in a transaction
    await db.$transaction([
      db.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash }
      }),
      db.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId }
      })
    ]);

    return NextResponse.json<ApiResponse>({ ok: true });
  } catch (error) {
    console.error(`api.auth.reset-password.failed`, error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: 'server_error', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
