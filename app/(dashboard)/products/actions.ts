'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { productSchema } from '@/lib/validators/product';
import { generateUniqueSlug } from '@/lib/slug';
import type { ActionResult } from '@/types';

export async function createProduct(formData: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { ok: false, error: { code: 'unauthorized', message: 'You must be logged in' } };
    }

    const parsed = productSchema.safeParse(formData);
    if (!parsed.success) {
      return { ok: false, error: { code: 'invalid_input', message: 'Invalid product data' } };
    }

    const { name, description, priceInNaira, imageUrl } = parsed.data;
    const priceInKobo = Math.round(priceInNaira * 100);
    const uniqueSlug = await generateUniqueSlug(name);

    const product = await db.product.create({
      data: {
        userId: session.user.id,
        name,
        description,
        price: priceInKobo,
        imageUrl,
        uniqueSlug,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/products');

    return { ok: true, data: { id: product.id } };
  } catch (error) {
    console.error('createProduct error:', error);
    return { ok: false, error: { code: 'server_error', message: 'Failed to create product' } };
  }
}

export async function updateProduct(id: string, formData: unknown): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { ok: false, error: { code: 'unauthorized', message: 'You must be logged in' } };
    }

    const product = await db.product.findUnique({ where: { id } });
    if (!product || product.userId !== session.user.id || product.deletedAt) {
      return { ok: false, error: { code: 'not_found', message: 'Product not found' } };
    }

    const parsed = productSchema.safeParse(formData);
    if (!parsed.success) {
      return { ok: false, error: { code: 'invalid_input', message: 'Invalid product data' } };
    }

    const { name, description, priceInNaira, imageUrl } = parsed.data;
    const priceInKobo = Math.round(priceInNaira * 100);

    await db.product.update({
      where: { id },
      data: { name, description, price: priceInKobo, imageUrl },
    });

    revalidatePath('/dashboard');
    revalidatePath('/products');
    revalidatePath(`/p/${product.uniqueSlug}`);

    return { ok: true };
  } catch (error) {
    console.error('updateProduct error:', error);
    return { ok: false, error: { code: 'server_error', message: 'Failed to update product' } };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { ok: false, error: { code: 'unauthorized', message: 'You must be logged in' } };
    }

    const product = await db.product.findUnique({ where: { id } });
    if (!product || product.userId !== session.user.id || product.deletedAt) {
      return { ok: false, error: { code: 'not_found', message: 'Product not found' } };
    }

    await db.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath('/dashboard');
    revalidatePath('/products');
    revalidatePath(`/p/${product.uniqueSlug}`);

    return { ok: true };
  } catch (error) {
    console.error('deleteProduct error:', error);
    return { ok: false, error: { code: 'server_error', message: 'Failed to delete product' } };
  }
}
