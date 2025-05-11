import type { Product } from './models/Product';
import type { Customer } from './models/Customer';
import type { Sale } from './models/Sale';
import type { Return, StoreCredit } from './models/Return';
import type { Notification } from './models/Notification';

// Import database implementations
import * as localDB from './db-models';
import * as postgresDB from './db-postgres';

// More robust environment detection
function isProductionEnvironment() {
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  const isProd = vercelEnv === 'production';
  
  console.log('DB Adapter - Environment Check:');
  console.log('NEXT_PUBLIC_VERCEL_ENV:', vercelEnv);
  console.log('Is Production?', isProd);
  
  // Check for required Postgres environment variables in production
  if (isProd) {
    const hasPgUrl = typeof process.env.POSTGRES_URL === 'string';
    console.log('Has POSTGRES_URL?', hasPgUrl);
    
    if (!hasPgUrl) {
      console.error('WARNING: Production environment detected but POSTGRES_URL is missing');
    }
  }
  
  return isProd;
}

// Determine if we're in a production environment (Vercel)
const isProduction = isProductionEnvironment();

// Use the appropriate database implementation based on environment
const db = isProduction ? postgresDB : localDB;

console.log(`DB Adapter - Using ${isProduction ? 'Postgres' : 'IndexedDB'} implementation`);

// Re-export all database functions
export const initializeDB = db.initializeDB;

// Product operations
export const getProducts = db.getProducts;
export const getProductById = db.getProductById;
export const addProduct = db.addProduct;
export const updateProduct = db.updateProduct;
export const deleteProduct = db.deleteProduct;

// Customer operations
export const getCustomers = db.getCustomers;
export const addCustomer = db.addCustomer;
export const updateCustomer = db.updateCustomer;
export const deleteCustomer = db.deleteCustomer;

// Sales operations
export const getSales = db.getSales;
export const getSaleById = db.getSaleById;
export const addSale = db.addSale;
export const updateSale = db.updateSale;
export const deleteSale = db.deleteSale;
export const getSalesByCustomer = db.getSalesByCustomer;
export const getRecentSales = db.getRecentSales;

// Returns operations
export const getReturns = db.getReturns;
export const getReturnById = db.getReturnById;
export const getReturnsByCustomer = db.getReturnsByCustomer;
export const getReturnsBySale = db.getReturnsBySale;
export const addReturn = db.addReturn;
export const updateReturn = db.updateReturn;
export const deleteReturn = db.deleteReturn;

// Store Credit operations
export const getStoreCredits = db.getStoreCredits;
export const getStoreCreditById = db.getStoreCreditById;
export const getStoreCreditsByCustomer = db.getStoreCreditsByCustomer;
export const updateStoreCredit = db.updateStoreCredit;

// Notification operations
export const getNotifications = db.getNotifications;
export const getUnreadNotifications = db.getUnreadNotifications;
export const getNotificationById = db.getNotificationById;
export const addNotification = db.addNotification;
export const updateNotification = db.updateNotification;
export const markNotificationAsRead = db.markNotificationAsRead;
export const markAllNotificationsAsRead = db.markAllNotificationsAsRead;
export const deleteNotification = db.deleteNotification;
export const deleteAllNotifications = db.deleteAllNotifications;
export const forceResetAllNotifications = db.forceResetAllNotifications;
export const generateLowStockNotifications = db.generateLowStockNotifications; 