import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../index';
import { Sale } from './Sale';
import { Product } from './Product';

export class SaleItem extends Model {
  declare id: number;
  declare saleId: number;
  declare productId: number;
  declare quantity: number;
  declare unitPrice: number;
  declare discount: number;
  declare total: number;
  declare serialNumber: string;
}

SaleItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    saleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Sale,
        key: 'id',
      },
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: 'id',
      },
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    serialNumber: {
      type: DataTypes.STRING,
      // For products that require serial number tracking
    },
  },
  {
    sequelize,
    modelName: 'SaleItem',
    timestamps: true,
  }
); 