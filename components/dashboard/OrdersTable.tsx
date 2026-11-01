import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatKoboToNaira, formatDateTime } from '@/lib/utils';
import styles from './OrdersTable.module.css';

type OrderWithProduct = {
  id: string;
  buyerEmail: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  transactionReference: string;
  createdAt: Date;
  product: {
    name: string;
  };
};

export function OrdersTable({ orders }: { orders: OrderWithProduct[] }) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Order ID</th>
            <th className={styles.th}>Product</th>
            <th className={styles.th}>Customer Email</th>
            <th className={styles.th}>Amount</th>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className={styles.tr}>
              <td className={styles.td}>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-on-surface-variant)' }}>
                  {order.id.slice(-8)}
                </span>
              </td>
              <td className={styles.td}>
                <div className={styles.productCell}>
                  <span className={styles.productName}>{order.product.name}</span>
                </div>
              </td>
              <td className={styles.td}>
                {order.buyerEmail || <span style={{ color: 'var(--color-on-surface-variant)' }}>N/A</span>}
              </td>
              <td className={styles.td}>{formatKoboToNaira(order.amount)}</td>
              <td className={styles.td}>{formatDateTime(order.createdAt)}</td>
              <td className={styles.td}>
                <Badge status={order.status}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
