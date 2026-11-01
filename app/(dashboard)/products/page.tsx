import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/dashboard/ProductCard';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import styles from './page.module.css';

export default async function ProductsPage() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth?mode=login');
  }

  const products = await db.product.findMany({
    where: { 
      userId: session.user.id,
      deletedAt: null
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <PageHeader 
        title="Products" 
        description="Manage your products and generate payment links."
        action={
          <Link href="/products/create">
            <Button>Create Product <Plus size={18} /></Button>
          </Link>
        }
      />
      
      {products.length === 0 ? (
        <EmptyState 
          title="No products yet"
          description="Create your first product to generate a payment link."
        />
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
