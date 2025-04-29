import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../index';

export class Product extends Model {
  declare id: number;
  declare name: string;
  declare sku: string;
  declare barcode: string;
  declare description: string;
  declare price: number;
  declare cost: number;
  declare quantity: number;
  declare minStockLevel: number;
  declare brand: string;
  declare model: string;
  declare serialNumber: string;
  declare categoryId: number;
  declare specifications: object;
  declare warranty: string;
  declare status: 'active' | 'discontinued' | 'out_of_stock';
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      unique: true,
    },
    barcode: {
      type: DataTypes.STRING,
      unique: true,
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    minStockLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    brand: DataTypes.STRING,
    model: DataTypes.STRING,
    serialNumber: DataTypes.STRING,
    specifications: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    warranty: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('active', 'discontinued', 'out_of_stock'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'Product',
    timestamps: true, // Adds createdAt and updatedAt
  }
); 