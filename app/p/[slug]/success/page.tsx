'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

function SuccessContent() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get('tx_ref');
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const MAX_RETRIES = 20;

  useEffect(() => {
    if (!txRef) {
      setStatus('failed');
      return;
    }

    let retries = 0;

    // Periodically check order status via API until it's paid or failed
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/orders/status?txRef=${txRef}`);
        const data = await res.json();
        
        if (data.ok && data.data.status === 'paid') {
          setStatus('success');
        } else if (data.ok && data.data.status === 'failed') {
          setStatus('failed');
        } else if (retries < MAX_RETRIES) {
          retries++;
          setTimeout(checkStatus, 3000);
        } else {
          setStatus('failed');
        }
      } catch {
        if (retries < MAX_RETRIES) {
          retries++;
          setTimeout(checkStatus, 3000);
        } else {
          setStatus('failed');
        }
      }
    };

    checkStatus();
  }, [txRef]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'verifying' && (
          <>
            <svg className={styles.icon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <h1 className={styles.title}>Verifying Payment</h1>
            <p className={styles.description}>Please wait while we confirm your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <svg className={styles.icon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h1 className={styles.title}>Payment Successful</h1>
            <p className={styles.description}>Thank you for your purchase. A receipt has been sent to your email.</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <svg className={styles.icon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h1 className={styles.title} style={{ color: 'var(--color-error)' }}>Payment Failed</h1>
            <p className={styles.description}>Your payment could not be processed. Please try again.</p>
          </>
        )}

        {status !== 'verifying' && (
          <div style={{ marginTop: '16px', width: '100%' }}>
            <Button onClick={() => window.location.href = '/'} variant="secondary" style={{ width: '100%' }}>
              Return to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <React.Suspense fallback={<div className={styles.container}><div className={styles.card}><p>Loading...</p></div></div>}>
      <SuccessContent />
    </React.Suspense>
  );
}
