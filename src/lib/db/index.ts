import { Sequelize } from 'sequelize';
import path from 'path';
import { app } from 'electron';

// Initialize SQLite database in the user's app data directory
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'pos_database.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Disable logging in production
});

// Define models
import { Product } from './models/Product';
import { Category } from './models/Category';
import { Customer } from './models/Customer';
import { Sale } from './models/Sale';
import { SaleItem } from './models/SaleItem';
import { Payment } from './models/Payment';
import { InstallmentPlan } from './models/InstallmentPlan';

// Initialize database
export async function initializeDB() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
    await sequelize.sync();
    console.log('Database models synchronized successfully.');

    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

export const models = {
  Product,
  Category,
  Customer,
  Sale,
  SaleItem,
  Payment,
  InstallmentPlan,
}; 