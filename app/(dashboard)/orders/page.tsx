import React from 'react';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { OrdersTable } from '@/components/dashboard/OrdersTable';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export default async function OrdersPage() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth?mode=login');
  }

  const orders = await db.order.findMany({
    where: { 
      product: { userId: session.user.id }
    },
    include: {
      product: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <PageHeader 
        title="Orders" 
        description="View your recent sales and transactions."
      />
      
      {orders.length === 0 ? (
        <EmptyState 
          title="No orders yet"
          description="When customers buy your products, their orders will appear here."
        />
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
