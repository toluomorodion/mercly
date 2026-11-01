import React from 'react';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProductForm } from '@/components/dashboard/ProductForm';
import { getSession } from '@/lib/auth';

export default async function CreateProductPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/auth?mode=login');
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader 
        title="Create Product" 
        description="Add a new product to generate a payment link."
      />
      <ProductForm />
    </div>
  );
}
