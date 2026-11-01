import React from 'react';
import styles from './Spinner.module.css';

export type SpinnerProps = React.SVGAttributes<SVGSVGElement> & {
  size?: number;
};

export function Spinner({ size = 24, className, ...props }: SpinnerProps) {
  return (
    <svg 
      className={`${styles.spinner} ${className ?? ''}`} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
    </svg>
  );
}
