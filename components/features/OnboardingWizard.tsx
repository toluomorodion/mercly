'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CheckCheck } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import styles from './OnboardingWizard.module.css';

type Step = 1 | 2 | 3;

type OnboardingWizardProps = {
  userName: string;
  initialBusinessName: string;
};

export function OnboardingWizard({ userName, initialBusinessName }: OnboardingWizardProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [businessNameError, setBusinessNameError] = useState('');

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productNameError, setProductNameError] = useState('');
  const [productPriceError, setProductPriceError] = useState('');
  const [productDescriptionError, setProductDescriptionError] = useState('');

  const [createdProductName, setCreatedProductName] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleStep1Next = () => {
    if (!businessName.trim()) {
      setBusinessNameError('Business name is required');
      return;
    }
    setStep(2);
  };

  const handleCreateProduct = async () => {
    let hasError = false;
    setProductNameError('');
    setProductPriceError('');
    setProductDescriptionError('');

    if (!productName.trim()) {
      setProductNameError('Product name is required');
      hasError = true;
    }
    if (!productPrice || parseFloat(productPrice) < 100) {
      setProductPriceError('Price must be at least 100 Naira');
      hasError = true;
    }
    if (hasError) return;

    setIsLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(imageFile);
        });
      }

      const res = await fetch('/api/onboarding/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName.trim(),
          priceInNaira: parseFloat(productPrice),
          description: productDescription.trim() || undefined,
          imageUrl,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        addToast(data.error?.message || 'Failed to create product', 'error');
        return;
      }

      setCreatedProductName(data.product.name);
      setShareUrl(`${window.location.origin}/p/${data.product.uniqueSlug}`);
      setStep(3);
    } catch {
      addToast('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSkipProduct = () => {
    setStep(3);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName }),
      });

      const data = await res.json();
      if (!data.ok) {
        addToast(data.error?.message || 'Something went wrong', 'error');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      addToast('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wizard}>
      <div className={styles.steps}>
        <div className={`${styles.stepDot} ${step >= 1 ? styles.stepActive : ''}`}>
          {step > 1 ? <CheckIcon /> : <span>1</span>}
        </div>
        <div className={`${styles.connector} ${step >= 2 ? styles.connectorActive : ''}`} />
        <div className={`${styles.stepDot} ${step >= 2 ? styles.stepActive : ''}`}>
          {step > 2 ? <CheckIcon /> : <span>2</span>}
        </div>
        <div className={`${styles.connector} ${step >= 3 ? styles.connectorActive : ''}`} />
        <div className={`${styles.stepDot} ${step >= 3 ? styles.stepActive : ''}`}>
          <span>3</span>
        </div>
      </div>

      <Card padding="lg">
        {step === 1 && (
          <div className={styles.stepContent}>
            <h1 className={styles.title}>Welcome to Mercly, {userName}!</h1>
            <p className={`${styles.description} ${styles.descriptionStep1}`}>
              Let&apos;s get your store set up.
            </p>

            <div className={styles.form}>
              <div>
                <Input
                  label="Your Business Name"
                  name="businessName"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    if (businessNameError) setBusinessNameError('');
                  }}
                  autoFocus
                />
                {businessNameError && (
                  <span className={styles.fieldError}>{businessNameError}</span>
                )}
              </div>
            </div>

            <div className={`${styles.actions} ${styles.actionsColumn}`}>
              <Button size="lg" onClick={handleStep1Next}>
                Continue
              </Button>
              <button type="button" className={styles.skipLink} onClick={handleComplete}>
                Skip Onboarding
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <h2 className={`${styles.title} ${styles.titleCentered}`}>Create Your First Product</h2>
            <p className={`${styles.description} ${styles.descriptionCentered} ${styles.descriptionReducedGap}`}>
              Add a product to generate your shareable payment link.
            </p>
            <button type="button" className={styles.backLink} onClick={() => setStep(1)}>
              &larr; Go Back to Step 1
            </button>

            <div className={styles.form}>
              <div className={styles.imageUpload}>
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className={styles.imagePreview} />
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Click or drag image to upload</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handleImageChange}
                />
              </div>

              <div>
                <Input
                  label="Product Name"
                  name="productName"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    if (productNameError) setProductNameError('');
                  }}
                  autoFocus
                  required
                />
                {productNameError && (
                  <span className={styles.fieldError}>{productNameError}</span>
                )}
              </div>
              <div>
                <Input
                  label="Price (Naira)"
                  name="productPrice"
                  type="number"
                  step="0.01"
                  min="100"
                  value={productPrice}
                  onChange={(e) => {
                    setProductPrice(e.target.value);
                    if (productPriceError) setProductPriceError('');
                  }}
                  required
                />
                {productPriceError && (
                  <span className={styles.fieldError}>{productPriceError}</span>
                )}
              </div>
              <div>
                <label className={styles.textareaLabel}>Description</label>
                <textarea
                  name="description"
                  className={`${styles.textarea} ${productDescriptionError ? styles.textareaError : ''}`}
                  value={productDescription}
                  onChange={(e) => {
                    setProductDescription(e.target.value);
                    if (productDescriptionError) setProductDescriptionError('');
                  }}
                  rows={3}
                  placeholder="Describe what you're selling..."
                />
                {productDescriptionError && (
                  <span className={styles.textareaErrorText}>{productDescriptionError}</span>
                )}
              </div>
            </div>

            <div className={`${styles.actions} ${styles.actionsColumn}`}>
              <Button size="lg" onClick={handleCreateProduct} isLoading={isLoading}>
                Create Product
              </Button>
              <Button variant="secondary" size="lg" onClick={handleSkipProduct} disabled={isLoading}>
                Skip
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`${styles.stepContent} ${styles.step3Content}`}>
            <div className={styles.successIcon}>
              <CheckCheck size={24} strokeWidth={2.5} />
            </div>
            <h2 className={`${styles.title} ${styles.titleCentered}`}>You&apos;re All Set!</h2>
            {createdProductName ? (
              <>
                <p className={styles.description}>
                  Your product <strong>{createdProductName}</strong> is ready to sell.
                  Share this link with your customers:
                </p>
                <div className={styles.linkBox}>
                  <input
                    type="text"
                    className={styles.linkInput}
                    value={shareUrl}
                    readOnly
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      addToast('Link copied to clipboard!', 'success');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </>
            ) : null}

            <div className={styles.actions}>
              <Button size="lg" onClick={handleComplete} isLoading={isLoading}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
