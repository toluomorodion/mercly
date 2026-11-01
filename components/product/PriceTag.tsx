import React from 'react';
import { formatKoboToNaira } from '@/lib/utils';
import styles from './PriceTag.module.css';

export function PriceTag({ priceInKobo }: { priceInKobo: number }) {
  const formatted = formatKoboToNaira(priceInKobo);
  // Extract currency symbol (₦) and the amount
  const symbol = formatted.substring(0, 1);
  const amount = formatted.substring(1);

  return (
    <div className={styles.price}>
      <span className={styles.currency}>{symbol}</span>
      {amount}
    </div>
  );
}
