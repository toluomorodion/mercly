'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CopyLinkButton } from './CopyLinkButton';
import { formatKoboToNaira } from '@/lib/utils';
import { deleteProduct } from '@/app/(dashboard)/products/actions';
import { useToast } from '@/components/shared/Toast';
import styles from './ProductCard.module.css';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  uniqueSlug: string;
};

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setIsDeleting(true);
    const result = await deleteProduct(product.id);
    
    if (!result.ok) {
      addToast(result.error?.message || 'Failed to delete product', 'error');
      setIsDeleting(false);
    } else {
      addToast('Product deleted', 'success');
      router.refresh();
    }
  };

  return (
    <Card padding="none" className={styles.root}>
      <div className={styles.imageContainer}>
        {product.imageUrl ? (
          <Image 
            src={product.imageUrl} 
            alt={product.name} 
            fill 
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : null}
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>{formatKoboToNaira(product.price)}</p>
        
        <div className={styles.footer}>
          <CopyLinkButton slug={product.uniqueSlug} className={styles.link} />
          <Link href={`/products/${product.id}/edit`}>
            <Button variant="secondary" aria-label="Edit product">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </Button>
          </Link>
          <button 
            className={styles.deleteBtn} 
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete product"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}
