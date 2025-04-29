import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../index';

export class Customer extends Model {
  declare id: number;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare phone: string;
  declare address: string;
  declare idType: string;
  declare idNumber: string;
  declare creditLimit: number;
  declare status: 'active' | 'inactive' | 'blacklisted';
  declare notes: string;
}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: DataTypes.TEXT,
    idType: {
      type: DataTypes.STRING, // e.g., "Driver's License", "Passport", etc.
      allowNull: false,
    },
    idNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creditLimit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blacklisted'),
      defaultValue: 'active',
    },
    notes: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: 'Customer',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['idType', 'idNumber'],
      },
    ],
  }
); 