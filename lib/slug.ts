import { db } from './db';

export async function generateUniqueSlug(name: string): Promise<string> {
  // Convert name to basic slug
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
    
  let slug = baseSlug || 'product';
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const existing = await db.product.findUnique({
      where: { uniqueSlug: slug },
    });

    if (!existing) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return slug;
}
