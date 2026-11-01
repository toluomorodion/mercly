import React from 'react';
import styles from './layout.module.css';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.logo}>Mercly</div>
        {children}
      </div>
    </main>
  );
}
