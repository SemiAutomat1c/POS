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
  createdAt?: Date;
  updatedAt?: Date;
}

// Default values and validation would be handled at the application level
// This is a simple data structure for use with IndexedDB 