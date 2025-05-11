// Customer model for IndexedDB
// Converted from Sequelize model to simple TypeScript interface

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  totalPurchases?: number;
  totalSpent?: number;
  lastPurchaseDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Default values and validation would be handled at the application level
// This is a simple data structure for use with IndexedDB 