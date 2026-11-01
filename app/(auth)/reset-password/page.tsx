'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/shared/Toast';
import styles from './page.module.css';

function ResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!data.ok) {
        addToast(data.error.message || 'Failed to reset password', 'error');
      } else {
        addToast('Password has been reset successfully', 'success');
        router.push('/auth?mode=login');
      }
    } catch {
      addToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card padding="lg">
        <h1 className={styles.title}>Invalid Link</h1>
        <div className={styles.errorMessage}>
          This password reset link is missing or invalid. Please request a new one.
        </div>
        <div className={styles.links}>
          <Link href="/forgot-password" className={styles.link}>
            Request new reset link
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h1 className={styles.title}>Set New Password</h1>
      <p className={styles.subtitle}>Enter your new password below.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="New Password"
          type="password"
          name="password"
          required
          placeholder="At least 8 characters"
          minLength={8}
        />
        <Button type="submit" size="lg" isLoading={isLoading}>
          Reset Password
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<Card padding="lg"><div style={{ textAlign: 'center' }}>Loading...</div></Card>}>
      <ResetContent />
    </React.Suspense>
  );
}
