import React from 'react';
import styles from './Badge.module.css';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  status: 'pending' | 'paid' | 'failed';
};

const statusMap = {
  pending: styles.pending,
  paid: styles.paid,
  failed: styles.failed,
} as const;

export function Badge({ status, className, children, ...props }: BadgeProps) {
  return (
    <span className={`${styles.base} ${statusMap[status]} ${className ?? ''}`} {...props}>
      {children}
    </span>
  );
}
