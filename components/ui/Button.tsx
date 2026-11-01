import styles from './Button.module.css';
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
};

const variantMap = {
  primary: styles.primary,
  secondary: styles.secondary,
  danger: styles.danger,
} as const;

const sizeMap = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
} as const;

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  className, 
  children,
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`${variantMap[variant]} ${sizeMap[size]} ${className ?? ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className={styles.spinner} viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
          </path>
        </svg>
      )}
      {children}
    </button>
  );
}
