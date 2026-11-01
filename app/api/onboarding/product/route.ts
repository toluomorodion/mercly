import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateUniqueSlug } from '@/lib/slug';

const onboardingProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  priceInNaira: z.number().min(100, 'Price must be at least 100 Naira'),
  description: z.string().optional(),
  imageUrl: z.string().optional().default(''),
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
    const parsed = onboardingProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'invalid_input', message: 'Check your input' } },
        { status: 400 }
      );
    }

    const { name, priceInNaira, description, imageUrl } = parsed.data;
    const priceInKobo = Math.round(priceInNaira * 100);
    const uniqueSlug = await generateUniqueSlug(name);

    const product = await db.product.create({
      data: {
        userId: session.user.id,
        name,
        description: description || '',
        price: priceInKobo,
        imageUrl,
        uniqueSlug,
      },
    });

    return NextResponse.json({
      ok: true,
      product: {
        id: product.id,
        name: product.name,
        uniqueSlug: product.uniqueSlug,
      },
    });
  } catch (error) {
    console.error('onboarding.product.error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'server_error', message: 'Failed to create product' } },
      { status: 500 }
    );
  }
}
