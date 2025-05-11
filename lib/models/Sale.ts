// Sale model for IndexedDB
// Converted from Sequelize model to simple TypeScript interface

export interface Sale {
  id: number;
  date: Date | string;
  customerId?: number;
  total: number;
  tax?: number;
  discount?: number;
  status: 'completed' | 'returned' | 'cancelled';
  notes?: string;
  items?: SaleItem[];
  payments?: Payment[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Supporting interfaces
export interface SaleItem {
  id?: number;
  saleId?: number;
  productId: number;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
  serialNumber?: string; // Track specific item sold by serial number
}

export interface Payment {
  id: number;
  saleId: number;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'other';
  reference?: string;
  date: Date | string;
}

// Default values and validation would be handled at the application level
// This is a simple data structure for use with IndexedDB 