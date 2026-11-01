import React from 'react';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProductForm } from '@/components/dashboard/ProductForm';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth?mode=login');
  }

  const product = await db.product.findUnique({
    where: { id }
  });

  if (!product || product.userId !== session.user.id || product.deletedAt) {
    redirect('/products');
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader 
        title="Edit Product" 
        description="Update your product details."
      />
      <ProductForm initialData={product} />
    </div>
  );
}
