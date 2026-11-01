import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

const completeSchema = z.object({
  businessName: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { ok: false, error: { code: 'unauthorized', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = completeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'invalid_input', message: 'Check your input' } },
        { status: 400 }
      );
    }

    const updateData: Record<string, string | boolean> = { onboardingCompleted: true };
    if (parsed.data.businessName) {
      updateData.businessName = parsed.data.businessName;
    }

    await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('onboarding.complete.error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'server_error', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
