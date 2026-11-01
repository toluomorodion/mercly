import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ProductImage } from '@/components/product/ProductImage';
import { PriceTag } from '@/components/product/PriceTag';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { uniqueSlug: slug },
    include: { user: true }
  });

  if (!product || product.deletedAt) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.imageSection}>
          <ProductImage src={product.imageUrl} alt={product.name} />
        </div>
        <div className={styles.contentSection}>
          <div>
            <div className={styles.storeName}>{product.user.businessName}</div>
            <h1 className={styles.title}>{product.name}</h1>
          </div>
          
          <div className={styles.description}>
            {product.description}
          </div>

          <div className={styles.actions}>
            <PriceTag priceInKobo={product.price} />
            <Link href={`/p/${product.uniqueSlug}/checkout`} style={{ width: '100%' }}>
              <Button size="lg" style={{ width: '100%' }}>
                Buy Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
