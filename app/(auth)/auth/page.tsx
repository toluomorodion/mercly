'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/shared/Toast';
import styles from './page.module.css';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'signup';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; businessName?: string }>({});
  const [emailFormatError, setEmailFormatError] = useState<string | undefined>(undefined);
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const params = new URLSearchParams(window.location.search);
      params.delete('error');
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
      window.history.replaceState(null, '', newUrl);
      addToast('Invalid email or password', 'error');
    }
  }, [searchParams, addToast]);

  const passwordRequirements = [
    { label: 'Minimum of 8 characters', test: (v: string) => v.length >= 8 },
    { label: 'Must contain an uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
    { label: 'Must contain a lowercase letter', test: (v: string) => /[a-z]/.test(v) },
    { label: 'Must contain a number', test: (v: string) => /\d/.test(v) },
    { label: 'Must contain a special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
  ];

  const firstUnmetRequirement = password.length > 0
    ? passwordRequirements.find((r) => !r.test(password))?.label
    : undefined;

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: { email?: string; password?: string } = {};
    if (!loginEmail.trim()) {
      errors.email = 'Field cannot be empty';
    }
    if (!loginPassword) {
      errors.password = 'Field cannot be empty';
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    setIsLoading(true);

    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: loginEmail,
        password: loginPassword,
      });

      setIsLoading(false);

      if (result?.error || !result?.ok) {
        addToast('Invalid email or password', 'error');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setIsLoading(false);
      addToast('Invalid email or password', 'error');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!businessName.trim()) {
      setFieldErrors((prev) => ({ ...prev, businessName: 'Field cannot be empty' }));
      return;
    }

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, businessName, email, password }),
      });

      const data = await res.json();

      if (!data.ok) {
        addToast(data.error.message || 'Signup failed', 'error');
        setIsLoading(false);
        return;
      }

      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        addToast('Account created but login failed. Please log in manually.', 'error');
        setMode('login');
      } else {
        router.push('/onboarding');
        router.refresh();
      }
    } catch {
      addToast('An unexpected error occurred. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg">
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${mode === 'signup' ? styles.activeTab : ''}`}
          onClick={() => {
            setMode('signup');
            setStep(1);
          }}
        >
          Create Account
        </button>
        <button
          type="button"
          className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
          onClick={() => {
            setMode('login');
          }}
        >
          Log In
        </button>
      </div>

      {mode === 'signup' ? (
        <>
          <h1 className={styles.title}>Create your Account</h1>

          <form
            className={styles.form}
            onSubmit={handleSignupSubmit}
          >
            {step === 1 && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  required
                  value={name}
                  error={fieldErrors.name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  autoFocus
                />
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  required
                  value={email}
                  error={fieldErrors.email || emailFormatError}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    if (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      setEmailFormatError('Enter a valid email address');
                    } else {
                      setEmailFormatError(undefined);
                    }
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                />
                <Button
                  type="button"
                  size="lg"
                  onClick={() => {
                    const errors: { name?: string; email?: string } = {};
                    if (!name.trim()) errors.name = 'Field cannot be empty';
                    else if (name.trim().length < 2) errors.name = 'Full name must be at least 2 characters';
                    if (!email.trim()) errors.email = 'Field cannot be empty';
                    setFieldErrors(errors);
                    if (Object.keys(errors).length > 0) return;
                    setStep(2);
                  }}
                >
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <input type="hidden" name="name" value={name} />
                <input type="hidden" name="email" value={email} />
                <Input
                  label="Business Name"
                  type="text"
                  name="businessName"
                  required
                  value={businessName}
                  error={fieldErrors.businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    if (fieldErrors.businessName) setFieldErrors((prev) => ({ ...prev, businessName: undefined }));
                  }}
                />
                <Input
                  label="Choose Password"
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText={firstUnmetRequirement}
                />
                <div className={styles.stepActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit" size="lg" isLoading={isLoading}>
                    Sign Up
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className={styles.links}>
            <span>
              Already have an account?{' '}
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                    setMode('login');
                }}
              >
                Log In
              </button>
            </span>
          </div>
        </>
      ) : (
        <>
          <h1 className={styles.title}>Welcome Back</h1>

          <form
            className={styles.form}
            onSubmit={handleLoginSubmit}
            noValidate
          >
            <Input
              label="Email Address"
              type="email"
              name="email"
              required
              value={loginEmail}
              error={loginErrors.email}
              onChange={(e) => {
                setLoginEmail(e.target.value);
                if (loginErrors.email) {
                  setLoginErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              required
              value={loginPassword}
              error={loginErrors.password}
              onChange={(e) => {
                setLoginPassword(e.target.value);
                if (loginErrors.password) {
                  setLoginErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
            />
            <Button type="submit" size="lg" isLoading={isLoading}>
              Log In
            </Button>
          </form>

          <div className={styles.links}>
            <Link href="/forgot-password" className={styles.link}>
              Forgot your password?
            </Link>
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  setMode('signup');
                }}
              >
                Log In
              </button>
            </span>
          </div>
        </>
      )}
    </Card>
  );
}

export default function AuthPage() {
  return (
    <React.Suspense fallback={<Card padding="lg"><div style={{ textAlign: 'center' }}>Loading...</div></Card>}>
      <AuthContent />
    </React.Suspense>
  );
}
