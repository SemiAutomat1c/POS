import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../index';
import { Product } from './Product';

export class Category extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
  declare slug: string;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: DataTypes.TEXT,
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Category',
    timestamps: true,
  }
);

// Define relationships
Category.hasMany(Product);
Product.belongsTo(Category); 