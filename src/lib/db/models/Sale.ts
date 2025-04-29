import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../index';
import { Customer } from './Customer';

export class Sale extends Model {
  declare id: number;
  declare customerId: number;
  declare total: number;
  declare discount: number;
  declare tax: number;
  declare paymentMethod: string;
  declare paymentStatus: string;
  declare notes: string;
  declare status: 'completed' | 'cancelled' | 'refunded';
}

Sale.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      references: {
        model: Customer,
        key: 'id',
      },
      allowNull: true, // For walk-in customers
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'installment'),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('paid', 'partial', 'pending'),
      defaultValue: 'pending',
    },
    notes: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('completed', 'cancelled', 'refunded'),
      defaultValue: 'completed',
    },
  },
  {
    sequelize,
    modelName: 'Sale',
    timestamps: true,
  }
); 