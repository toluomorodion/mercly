'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/shared/Toast';
import styles from './CopyLinkButton.module.css';

export function CopyLinkButton({ slug, className }: { slug: string; className?: string }) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      addToast('Link copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy link', 'error');
    }
  };

  return (
    <Button 
      variant={copied ? "primary" : "secondary"} 
      onClick={handleCopy}
      className={`${styles.button} ${className ?? ''}`}
      aria-label={copied ? "Copied" : "Copy link"}
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </Button>
  );
}
