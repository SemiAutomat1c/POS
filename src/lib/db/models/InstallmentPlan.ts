import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../index';
import { Sale } from './Sale';
import { Customer } from './Customer';

export class InstallmentPlan extends Model {
  declare id: number;
  declare saleId: number;
  declare customerId: number;
  declare totalAmount: number;
  declare downPayment: number;
  declare installmentAmount: number;
  declare numberOfInstallments: number;
  declare remainingInstallments: number;
  declare nextDueDate: Date;
  declare status: 'active' | 'completed' | 'defaulted';
}

InstallmentPlan.init(
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
    customerId: {
      type: DataTypes.INTEGER,
      references: {
        model: Customer,
        key: 'id',
      },
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    downPayment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    installmentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    numberOfInstallments: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remainingInstallments: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nextDueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'defaulted'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'InstallmentPlan',
    timestamps: true,
  }
); 