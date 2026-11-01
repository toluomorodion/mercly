import React from 'react';
import styles from './Card.module.css';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
};

const paddingMap = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
} as const;

export function Card({ 
  padding = 'md', 
  interactive = false,
  className, 
  children, 
  ...props 
}: CardProps) {
  return (
    <div 
      className={`${styles.root} ${paddingMap[padding]} ${interactive ? styles.interactive : ''} ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
