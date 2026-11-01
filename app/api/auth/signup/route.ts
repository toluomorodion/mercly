import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { signupSchema } from '@/lib/validators/auth';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: 'invalid_input', message: 'Check your input and try again.' } },
        { status: 400 }
      );
    }

    const { name, email, businessName, password } = parsed.data;

    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: 'conflict', message: 'Email is already in use.' } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        businessName,
        passwordHash
      }
    });

    return NextResponse.json<ApiResponse>({ ok: true });
  } catch (error) {
    console.error(`api.auth.signup.failed`, error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: 'server_error', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
