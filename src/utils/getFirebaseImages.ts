/**
 * Utility to get Firebase Storage image URLs from the gallery folder
 */

import { storage } from '@/firebase/config';
import { ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';

export interface FirebaseImage {
  name: string;
  url: string;
  fullPath: string;
  size?: number;
  timeCreated?: string;
}

/**
 * Get all images from Firebase Storage gallery folder
 */
export async function getGalleryImages(): Promise<FirebaseImage[]> {
  try {
    const galleryRef = ref(storage, 'blog-images/gallery');
    const result = await listAll(galleryRef);
    
    const images: FirebaseImage[] = [];
    
    for (const itemRef of result.items) {
      try {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);
        
        images.push({
          name: itemRef.name,
          url,
          fullPath: itemRef.fullPath,
          size: metadata?.size,
          timeCreated: metadata?.timeCreated
        });
      } catch (error) {
        // Error getting URL for image
      }
    }
    
    // Sort by creation time (newest first)
    images.sort((a, b) => {
      if (!a.timeCreated || !b.timeCreated) return 0;
      return new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime();
    });
    
    return images;
  } catch (error) {
      // Error listing gallery images
      return [];
    }
}

/**
 * Identify potential duplicate images based on file names
 */
export function identifyDuplicates(images: FirebaseImage[]): {
  duplicates: FirebaseImage[][];
  unique: FirebaseImage[];
} {
  const groups: { [key: string]: FirebaseImage[] } = {};
  
  // Group images by similar names (removing timestamps and extensions)
  images.forEach(image => {
    // Extract base name without timestamp and extension
    const baseName = image.name
      .replace(/\d{13,}/g, '') // Remove timestamps
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[-_]+/g, '-') // Normalize separators
      .toLowerCase();
    
    if (!groups[baseName]) {
      groups[baseName] = [];
    }
    groups[baseName].push(image);
  });
  
  const duplicates: FirebaseImage[][] = [];
  const unique: FirebaseImage[] = [];
  
  Object.values(groups).forEach(group => {
    if (group.length > 1) {
      duplicates.push(group);
    } else {
      unique.push(...group);
    }
  });
  
  return { duplicates, unique };
}

/**
 * Get unique image URLs for a blog post gallery
 */
export async function getUniqueGalleryUrls(): Promise<string[]> {
  try {
    const images = await getGalleryImages();
    const { duplicates, unique } = identifyDuplicates(images);
    
    // For duplicates, keep the newest one (first in sorted array)
    const selectedImages = [...unique];
    duplicates.forEach(group => {
      selectedImages.push(group[0]); // Keep the newest
    });
    
    return selectedImages.map(img => img.url);
  } catch (error) {
    // Error getting unique gallery URLs
    return [];
  }
}