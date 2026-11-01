import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional().default(''),
  priceInNaira: z.number().min(100, 'Price must be at least 100 Naira'),
  imageUrl: z.string().optional().default(''),
});

export type ProductFormValues = z.infer<typeof productSchema>;
