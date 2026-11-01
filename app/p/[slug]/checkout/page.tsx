import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { CheckoutForm } from '@/components/product/CheckoutForm';

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { uniqueSlug: slug },
  });

  if (!product || product.deletedAt) {
    notFound();
  }

  return <CheckoutForm product={product} />;
}
