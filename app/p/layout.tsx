import React from 'react';
import Link from 'next/link';
import styles from './layout.module.css';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        Powered by <Link href="/" className={styles.link}>Mercly</Link>
      </footer>
    </div>
  );
}
