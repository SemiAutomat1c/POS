import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../index';
import { Sale } from './Sale';
import { InstallmentPlan } from './InstallmentPlan';

export class Payment extends Model {
  declare id: number;
  declare saleId: number;
  declare installmentPlanId: number | null;
  declare amount: number;
  declare paymentMethod: string;
  declare referenceNumber: string;
  declare notes: string;
}

Payment.init(
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
    installmentPlanId: {
      type: DataTypes.INTEGER,
      references: {
        model: InstallmentPlan,
        key: 'id',
      },
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'gcash', 'maya'),
      allowNull: false,
    },
    referenceNumber: {
      type: DataTypes.STRING,
      // For card transactions, bank transfers, or digital payments
    },
    notes: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: 'Payment',
    timestamps: true,
  }
); 