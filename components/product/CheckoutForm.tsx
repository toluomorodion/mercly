'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/shared/Toast';
import { formatKoboToNaira } from '@/lib/utils';
import styles from '@/app/p/[slug]/checkout/page.module.css';

type CheckoutFormProps = {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    uniqueSlug: string;
  };
};

export function CheckoutForm({ product }: CheckoutFormProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, buyerEmail: email }),
      });

      const data = await res.json();

      if (!data.ok) {
        addToast(data.error?.message || 'Failed to initialize payment', 'error');
        setIsLoading(false);
      } else {
        // Redirect to Flutterwave hosted checkout
        window.location.href = data.data.paymentLink;
      }
    } catch (error) {
      addToast('An unexpected error occurred. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          {product.imageUrl ? (
            <Image 
              src={product.imageUrl} 
              alt={product.name} 
              width={64} 
              height={64} 
              className={styles.thumbnail}
            />
          ) : (
            <div className={styles.thumbnail} />
          )}
          <div className={styles.productInfo}>
            <div className={styles.productName}>{product.name}</div>
            <div className={styles.productPrice}>{formatKoboToNaira(product.price)}</div>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input 
            label="Your Email Address" 
            type="email" 
            name="email" 
            required 
            placeholder="For your receipt"
          />
          <Button type="submit" size="lg" isLoading={isLoading}>
            Pay Now
          </Button>
        </form>
      </div>
    </div>
  );
}
