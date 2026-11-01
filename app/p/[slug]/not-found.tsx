import React from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div style={{ padding: '48px 24px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <EmptyState 
        title="Product not available"
        description="This product has been removed by the seller or the link is incorrect."
        icon={
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        }
        action={
          <Link href="/">
            <Button variant="secondary">Go to Mercly</Button>
          </Link>
        }
      />
    </div>
  );
}
