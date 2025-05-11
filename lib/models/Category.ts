// Category model for IndexedDB
// Converted from Sequelize model to simple TypeScript interface

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Default values and validation would be handled at the application level
// This is a simple data structure for use with IndexedDB 