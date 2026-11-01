import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Banknote, Boxes, ShoppingCart, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { formatKoboToNaira } from '@/lib/utils';
import styles from './page.module.css';

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) {
    return (
      <span className={`${styles.trendBadge} ${styles.trendUp}`}>
        <TrendingUp size={14} strokeWidth={2} />
        <span>new</span>
      </span>
    );
  }
  const change = ((current - previous) / previous) * 100;
  const isUp = change >= 0;
  return (
    <span className={`${styles.trendBadge} ${isUp ? styles.trendUp : styles.trendDown}`}>
      {isUp ? <TrendingUp size={14} strokeWidth={2} /> : <TrendingDown size={14} strokeWidth={2} />}
      <span>{Math.abs(change).toFixed(1)}%</span>
    </span>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth?mode=login');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  if (user && !user.onboardingCompleted) {
    redirect('/onboarding');
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    productsCount,
    ordersCount,
    totalRevenue,
    currentRevenue,
    previousRevenue,
    currentOrders,
    previousOrders,
    currentProducts,
    previousProducts,
  ] = await Promise.all([
    // totals
    db.product.count({ where: { userId: session.user.id, deletedAt: null } }),
    db.order.count({ where: { product: { userId: session.user.id }, status: 'paid' } }),
    db.order.aggregate({ where: { product: { userId: session.user.id }, status: 'paid' }, _sum: { amount: true } }),
    // revenue trends
    db.order.aggregate({ where: { product: { userId: session.user.id }, status: 'paid', createdAt: { gte: thirtyDaysAgo } }, _sum: { amount: true } }),
    db.order.aggregate({ where: { product: { userId: session.user.id }, status: 'paid', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, _sum: { amount: true } }),
    // orders trends
    db.order.count({ where: { product: { userId: session.user.id }, status: 'paid', createdAt: { gte: thirtyDaysAgo } } }),
    db.order.count({ where: { product: { userId: session.user.id }, status: 'paid', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    // products trends
    db.product.count({ where: { userId: session.user.id, deletedAt: null, createdAt: { gte: thirtyDaysAgo } } }),
    db.product.count({ where: { userId: session.user.id, deletedAt: null, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
  ]);

  const revenue = totalRevenue._sum.amount || 0;

  return (
    <div>
      <PageHeader 
        title={`Welcome, ${session.user.businessName}`} 
        description="Here is what is happening with your store today."
        action={
          <Link href="/products/create">
            <Button>Create Product <Plus size={18} /></Button>
          </Link>
        }
      />
      
      <div className={styles.grid}>
        <Card padding="md" className={styles.statCard}>
          <div className={styles.statHeader}>
            <Banknote size={18} strokeWidth={1.5} />
            <span className={styles.statLabel}>Total Revenue</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statValue}>{formatKoboToNaira(revenue)}</span>
            <TrendBadge current={currentRevenue._sum.amount || 0} previous={previousRevenue._sum.amount || 0} />
          </div>
        </Card>
        <Card padding="md" className={styles.statCard}>
          <div className={styles.statHeader}>
            <Boxes size={18} strokeWidth={1.5} />
            <span className={styles.statLabel}>Total Orders</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statValue}>{ordersCount}</span>
            <TrendBadge current={currentOrders} previous={previousOrders} />
          </div>
        </Card>
        <Card padding="md" className={styles.statCard}>
          <div className={styles.statHeader}>
            <ShoppingCart size={18} strokeWidth={1.5} />
            <span className={styles.statLabel}>Active Products</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statValue}>{productsCount}</span>
            <TrendBadge current={currentProducts} previous={previousProducts} />
          </div>
        </Card>
      </div>
    </div>
  );
}
