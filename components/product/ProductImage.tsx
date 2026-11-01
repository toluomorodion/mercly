import React from 'react';
import Image from 'next/image';
import styles from './ProductImage.module.css';

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-on-surface-variant)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Image 
        src={src} 
        alt={alt} 
        fill 
        priority
        className={styles.image}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}
