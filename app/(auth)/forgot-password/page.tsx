'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/shared/Toast';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.ok) {
        addToast(data.error.message || 'Request failed', 'error');
      } else {
        setIsSuccess(true);
      }
    } catch {
      addToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg">
      <h1 className={styles.title}>Reset Password</h1>
      <p className={styles.subtitle}>Enter your email address and we&apos;ll send you a link to reset your password.</p>

      {isSuccess ? (
        <div className={styles.successMessage}>
          If an account exists with that email, we have sent a password reset link. Please check your inbox.
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            name="email"
            required
          />
          <Button type="submit" size="lg" isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>
      )}

      <div className={styles.links}>
        <Link href="/auth?mode=login" className={styles.link}>
          Back to log in
        </Link>
      </div>
    </Card>
  );
}
