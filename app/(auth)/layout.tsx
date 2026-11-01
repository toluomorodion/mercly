import React from 'react';
import Link from 'next/link';
import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div id="auth-error-portal" className={styles.portalTarget}></div>
        <Link href="/" className={styles.logo}>
          Mercly
        </Link>
        {children}
      </div>
    </main>
  );
}
