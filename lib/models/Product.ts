// Product model for IndexedDB
// Converted from Sequelize model to simple TypeScript interface

export interface Product {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  cost?: number;
  quantity: number;
  minStockLevel?: number;
  lowStockThreshold?: number; // Threshold for low stock notifications
  brand?: string;
  model?: string;
  serialNumber?: string;
  categoryId?: number;
  specifications?: Record<string, any>;
  warranty?: string;
  status?: 'active' | 'discontinued' | 'out_of_stock';
  // New fields for product variants
  color?: string;
  storage?: string;
  condition?: 'new' | 'pre-owned' | 'refurbished';
  // Product variant tracking
  isBaseProduct?: boolean; // Indicates if this is a base product (not a variant)
  baseProductId?: number; // Reference to the base product if this is a variant
  variantType?: string; // The type of variation (color, storage, etc.)
  variantValue?: string; // The value of the variation (blue, 256GB, etc.)
  variantName?: string; // Display name for this variant
  createdAt?: Date;
  updatedAt?: Date;
}

// New variant-related types for product management
export interface ProductVariantOption {
  type: string; // 'color', 'storage', etc.
  values: string[]; // ['blue', 'red', 'black'], etc.
}

export interface ProductWithVariants extends Product {
  variants?: Product[];
  variantOptions?: ProductVariantOption[];
}

// Default values and validation would be handled at the application level
// This is a simple data structure for use with IndexedDB 