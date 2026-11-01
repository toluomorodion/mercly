'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/shared/Toast';
import { createProduct, updateProduct } from '@/app/(dashboard)/products/actions';
import styles from './ProductForm.module.css';

type Product = {
  id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

export function ProductForm({ initialData }: { initialData?: Product }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imageUrl || '');
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string).trim();
    const description = (formData.get('description') as string).trim();
    const priceInNaira = parseFloat(formData.get('priceInNaira') as string);

    let hasError = false;
    setNameError('');
    setPriceError('');
    setDescriptionError('');

    if (!name) {
      setNameError('Product name is required');
      hasError = true;
    }
    if (!priceInNaira || priceInNaira < 100) {
      setPriceError('Price must be at least 100 Naira');
      hasError = true;
    }
    if (!description) {
      setDescriptionError('Description is required');
      hasError = true;
    }
    if (hasError) return;

    setIsLoading(true);

    let imageUrl = initialData?.imageUrl || '';
    try {
      if (imageFile) {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(imageFile);
        });
      }

      const data = {
        name,
        description,
        priceInNaira,
        imageUrl,
      };

      let result;
      if (initialData?.id) {
        result = await updateProduct(initialData.id, data);
      } else {
        result = await createProduct(data);
      }

      if (!result.ok) {
        addToast(result.error?.message || 'Failed to save product', 'error');
      } else {
        addToast(`Product ${initialData?.id ? 'updated' : 'created'} successfully`, 'success');
        router.push('/products');
        router.refresh();
      }
    } catch {
      addToast('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearNameError = useCallback(() => { setNameError(''); }, []);
  const clearPriceError = useCallback(() => { setPriceError(''); }, []);
  const clearDescriptionError = useCallback(() => { setDescriptionError(''); }, []);

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Card>
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
              name="name" 
              defaultValue={initialData?.name}
              onInput={clearNameError}
              required 
            />
            {nameError && (
              <span className={styles.fieldError}>{nameError}</span>
            )}
          </div>
          
          <div>
            <Input 
              label="Price (₦)" 
              name="priceInNaira" 
              type="number"
              step="0.01"
              min="100"
              defaultValue={initialData ? initialData.price / 100 : undefined}
              onInput={clearPriceError}
              required 
            />
            {priceError && (
              <span className={styles.fieldError}>{priceError}</span>
            )}
          </div>

          <div>
            <label className={styles.label}>Description</label>
            <textarea 
              name="description" 
              className={`${styles.textarea} ${descriptionError ? styles.textareaError : ''}`}
              defaultValue={initialData?.description}
              onInput={clearDescriptionError}
              rows={4}
              placeholder="Describe what you're selling..."
            />
            {descriptionError && (
              <span className={styles.fieldError}>{descriptionError}</span>
            )}
          </div>
        </div>
      </Card>

      <div className={styles.actions}>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData?.id ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
