// Integration file that connects our TypeScript interfaces with the IndexedDB implementation
// This file serves as a bridge between the old project's models and the new IndexedDB setup

import * as db from './db';

// Import types first to use them
import type { Product } from './models/Product';
import type { Customer } from './models/Customer';
import type { Sale, SaleItem, Payment } from './models/Sale';
import type { Category } from './models/Category';
import type { Return, ReturnItem, StoreCredit, ReturnStatus, ReturnType, ReturnReason, RefundMethod } from './models/Return';
import { Notification } from './models/Notification';

// Export types
export type { Product } from './models/Product';
export type { Customer } from './models/Customer';
export type { Sale, SaleItem, Payment } from './models/Sale';
export type { Category } from './models/Category';
export type { Return, ReturnItem, StoreCredit, ReturnStatus, ReturnType, ReturnReason, RefundMethod } from './models/Return';

// Re-export the DB functions
export const { initializeDB } = db;

// Product operations
export const getProducts = async (): Promise<Product[]> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<number> => {
  console.log("DB: Adding product:", product);
  
  // Check if serialNumber exists and is not empty before proceeding
  if (product.serialNumber) {
    // First, check if there's already a product with this serial number
    try {
      const existingProducts = await getProducts();
      const productWithSameSerial = existingProducts.find(
        p => p.serialNumber && p.serialNumber === product.serialNumber
      );
      
      if (productWithSameSerial) {
        console.error("DB: Cannot add product - serial number already exists:", product.serialNumber);
        throw new Error(`Product with serial number '${product.serialNumber}' already exists`);
      }
    } catch (error) {
      console.error("DB: Error checking for duplicate serial number:", error);
      throw error;
    }
  }
  
  // Ensure all fields are properly formatted for IndexedDB
  // Convert undefined values to null for IndexedDB
  const productToAdd = {
    ...product,
    name: product.name || '',
    price: product.price || 0,
    quantity: product.quantity || 0,
    serialNumber: product.serialNumber || null,
    sku: product.sku || null,
    barcode: product.barcode || null,
    description: product.description || null,
    cost: product.cost || null,
    minStockLevel: product.minStockLevel || 5,
    brand: product.brand || null,
    model: product.model || null,
    color: product.color || null,
    storage: product.storage || null,
    condition: product.condition || 'new',
    createdAt: product.createdAt || new Date(),
    updatedAt: product.updatedAt || new Date()
  };
  
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      
      console.log("DB: Created transaction, adding product to store:", productToAdd);
      const request = store.add(productToAdd);

      request.onsuccess = () => {
        const id = request.result as number;
        console.log("DB: Product added successfully with ID:", id);
        resolve(id);
      };

      request.onerror = (event) => {
        console.error("DB: Error adding product:", request.error, event);
        
        // Provide more specific error message based on the error
        if (request.error && request.error.name === 'ConstraintError') {
          reject(new Error("Database constraint error: Product may have a duplicate unique field (like serial number)"));
        } else {
          reject(request.error || new Error("Unknown database error occurred"));
        }
      };
      
      transaction.oncomplete = () => {
        console.log("DB: Transaction completed");
      };
      
      transaction.onerror = (event) => {
        console.error("DB: Transaction error:", event);
        reject(new Error("Transaction failed: " + (event.target as IDBTransaction).error?.message || "Unknown reason"));
      };
    } catch (error) {
      console.error("DB: Exception in addProduct:", error);
      reject(error);
    }
  });
};

export const updateProduct = async (product: Product): Promise<void> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    const request = store.put(product);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const deleteProduct = async (id: number): Promise<void> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Customer operations
export const getCustomers = async (): Promise<Customer[]> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['customers'], 'readonly');
    const store = transaction.objectStore('customers');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<number> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['customers'], 'readwrite');
    const store = transaction.objectStore('customers');
    const request = store.add(customer);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const updateCustomer = async (customer: Customer): Promise<void> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['customers'], 'readwrite');
    const store = transaction.objectStore('customers');
    const request = store.put(customer);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const deleteCustomer = async (id: number): Promise<void> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['customers'], 'readwrite');
    const store = transaction.objectStore('customers');
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Sales operations
export const getSales = async (): Promise<Sale[]> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sales'], 'readonly');
    const store = transaction.objectStore('sales');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const getSaleById = async (id: number): Promise<Sale | null> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sales'], 'readonly');
    const store = transaction.objectStore('sales');
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const addSale = async (sale: Omit<Sale, 'id'>): Promise<number> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sales'], 'readwrite');
    const store = transaction.objectStore('sales');
    
    // Ensure date is properly set
    const saleWithDate = {
      ...sale,
      date: sale.date || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const request = store.add(saleWithDate);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const updateSale = async (sale: Sale): Promise<void> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sales'], 'readwrite');
    const store = transaction.objectStore('sales');
    
    // Update the updatedAt timestamp
    const updatedSale = {
      ...sale,
      updatedAt: new Date()
    };
    
    const request = store.put(updatedSale);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const deleteSale = async (id: number): Promise<void> => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sales'], 'readwrite');
    const store = transaction.objectStore('sales');
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Get sales by customer ID
export const getSalesByCustomer = async (customerId: number): Promise<Sale[]> => {
  const allSales = await getSales();
  return allSales.filter(sale => sale.customerId === customerId);
};

// Get recent sales (last 30 days by default)
export const getRecentSales = async (days: number = 30): Promise<Sale[]> => {
  const allSales = await getSales();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return allSales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= cutoffDate;
  });
};

// Returns Management
export async function getReturns(): Promise<Return[]> {
  try {
    return await db.getAll<Return>('returns');
  } catch (error) {
    console.error('Error getting returns:', error);
    return [];
  }
}

export async function getReturnById(id: number): Promise<Return | null> {
  try {
    const returnData = await db.get<Return>('returns', id);
    return returnData || null;
  } catch (error) {
    console.error('Error getting return:', error);
    return null;
  }
}

export async function getReturnsByCustomer(customerId: number): Promise<Return[]> {
  try {
    const returns = await db.getAllFromIndex<Return>('returns', 'customerId', customerId);
    return returns || [];
  } catch (error) {
    console.error('Error getting returns by customer:', error);
    return [];
  }
}

export async function getReturnsBySale(saleId: number): Promise<Return[]> {
  try {
    const returns = await db.getAllFromIndex<Return>('returns', 'originalSaleId', saleId);
    return returns || [];
  } catch (error) {
    console.error('Error getting returns by sale:', error);
    return [];
  }
}

export async function addReturn(returnData: Omit<Return, 'id'>): Promise<Return> {
  try {
    // Create the return 
    const id = await db.add('returns', {
      ...returnData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Update product inventory based on return items
    if (returnData.items && returnData.status === 'completed') {
      for (const item of returnData.items) {
        if (item.returnToInventory) {
          const product = await db.getProductById(item.productId);
          if (product) {
            // Add the returned quantity back to inventory
            await db.updateProduct({
              ...product,
              quantity: product.quantity + item.returnedQuantity
            });
          }
        }
      }
    }
    
    // If store credit was issued, create it
    if (returnData.returnType === 'store_credit' && returnData.storeCredit) {
      await db.add('storeCredits', {
        ...returnData.storeCredit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    const newReturn = await getReturnById(id as number);
    return newReturn as Return;
  } catch (error) {
    console.error('Error adding return:', error);
    throw error;
  }
}

export async function updateReturn(returnData: Return): Promise<Return> {
  try {
    const existingReturn = await getReturnById(returnData.id);
    if (!existingReturn) {
      throw new Error('Return not found');
    }
    
    // Check if status changed to completed
    const statusChanged = existingReturn.status !== 'completed' && returnData.status === 'completed';
    
    // Update the return
    await db.put('returns', {
      ...returnData,
      updatedAt: new Date().toISOString()
    });
    
    // If status changed to completed, update inventory
    if (statusChanged) {
      for (const item of returnData.items) {
        if (item.returnToInventory) {
          const product = await db.getProductById(item.productId);
          if (product) {
            // Add the returned quantity back to inventory
            await db.updateProduct({
              ...product,
              quantity: product.quantity + item.returnedQuantity
            });
          }
        }
      }
    }
    
    const updatedReturn = await getReturnById(returnData.id);
    return updatedReturn as Return;
  } catch (error) {
    console.error('Error updating return:', error);
    throw error;
  }
}

export async function deleteReturn(id: number): Promise<void> {
  try {
    await db.delete_('returns', id);
  } catch (error) {
    console.error('Error deleting return:', error);
    throw error;
  }
}

// Store Credit Management
export async function getStoreCredits(): Promise<StoreCredit[]> {
  try {
    const storeCredits = await db.getAll<StoreCredit>('storeCredits');
    return storeCredits || [];
  } catch (error) {
    console.error('Error getting store credits:', error);
    return [];
  }
}

export async function getStoreCreditById(id: number): Promise<StoreCredit | null> {
  try {
    const storeCredit = await db.get<StoreCredit>('storeCredits', id);
    return storeCredit || null;
  } catch (error) {
    console.error('Error getting store credit:', error);
    return null;
  }
}

export async function getStoreCreditsByCustomer(customerId: number): Promise<StoreCredit[]> {
  try {
    const storeCredits = await db.getAllFromIndex<StoreCredit>('storeCredits', 'customerId', customerId);
    return storeCredits || [];
  } catch (error) {
    console.error('Error getting store credits by customer:', error);
    return [];
  }
}

export async function updateStoreCredit(storeCredit: StoreCredit): Promise<StoreCredit> {
  try {
    await db.put('storeCredits', {
      ...storeCredit,
      updatedAt: new Date().toISOString()
    });
    
    const updatedStoreCredit = await getStoreCreditById(storeCredit.id);
    return updatedStoreCredit as StoreCredit;
  } catch (error) {
    console.error('Error updating store credit:', error);
    throw error;
  }
}

// Notification Management
export async function getNotifications(): Promise<Notification[]> {
  try {
    const notifications = await db.getAll<Notification>('notifications');
    return notifications || [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

export async function getUnreadNotifications(): Promise<Notification[]> {
  try {
    const notifications = await db.getAllFromIndex<Notification>('notifications', 'isRead', false);
    return notifications || [];
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return [];
  }
}

export async function getNotificationById(id: number): Promise<Notification | null> {
  try {
    const notification = await db.get<Notification>('notifications', id);
    return notification || null;
  } catch (error) {
    console.error('Error getting notification:', error);
    return null;
  }
}

export async function addNotification(notification: Omit<Notification, 'id'>): Promise<Notification | null> {
  try {
    // Set defaults if not provided
    const notificationWithDefaults = {
      ...notification,
      isRead: notification.isRead ?? false,
      createdAt: notification.createdAt || new Date().toISOString()
    };
    
    const id = await db.add('notifications', notificationWithDefaults);
    const addedNotification = await getNotificationById(id as number);
    return addedNotification;
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
}

export async function updateNotification(notification: Notification): Promise<Notification | null> {
  try {
    await db.put('notifications', notification);
    const updatedNotification = await getNotificationById(notification.id);
    return updatedNotification;
  } catch (error) {
    console.error('Error updating notification:', error);
    return null;
  }
}

export async function markNotificationAsRead(id: number): Promise<Notification | null> {
  try {
    console.log('db-models: Marking notification as read:', id);
    const notification = await getNotificationById(id);
    
    if (!notification) {
      console.error('db-models: Notification not found with ID:', id);
      return null;
    }
    
    // Only update if it's not already read
    if (notification.isRead) {
      console.log('db-models: Notification already marked as read:', id);
      return notification;
    }
    
    const updatedNotification = {
      ...notification,
      isRead: true
    };
    
    await db.put('notifications', updatedNotification);
    console.log('db-models: Successfully marked notification as read:', id);
    
    // Verify the update was successful by reading from DB again
    const verifiedNotification = await getNotificationById(id);
    if (verifiedNotification?.isRead !== true) {
      console.warn('db-models: Notification was not properly marked as read:', id);
    }
    
    return verifiedNotification;
  } catch (error) {
    console.error('db-models: Error marking notification as read:', id, error);
    return null;
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const unreadNotifications = await getUnreadNotifications();
    
    for (const notification of unreadNotifications) {
      await db.put('notifications', {
        ...notification,
        isRead: true
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

export async function deleteNotification(id: number): Promise<boolean> {
  try {
    await db.delete_('notifications', id);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

export async function deleteAllNotifications(): Promise<boolean> {
  try {
    const notifications = await getNotifications();
    
    for (const notification of notifications) {
      await db.delete_('notifications', notification.id);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return false;
  }
}

// Generate low stock notifications based on inventory
export async function generateLowStockNotifications(): Promise<number> {
  try {
    console.log('Checking for low stock items...');
    const products = await getProducts();
    let notificationsCreated = 0;
    
    // First, clean up any stale or duplicate notifications
    await cleanupExistingNotifications();
    
    // Find products with low stock or out of stock
    const lowStockProducts = products.filter(product => {
      const threshold = product.minStockLevel || 5;
      return product.quantity <= threshold;
    });
    
    if (lowStockProducts.length === 0) {
      console.log('No products with low stock found');
      return 0;
    }
    
    console.log(`Found ${lowStockProducts.length} products with low stock`);
    
    // Get existing notifications to avoid duplicates
    const existingNotifications = await getNotifications();
    
    for (const product of lowStockProducts) {
      // Set appropriate priority based on stock level
      let priority: 'low' | 'medium' | 'high' = 'medium';
      let title = 'Low Stock Alert';
      let message = `${product.name} is running low on stock (${product.quantity} remaining)`;
      
      // Out of stock gets high priority and different message
      if (product.quantity <= 0) {
        priority = 'high';
        title = 'Out of Stock Alert';
        message = `${product.name} is out of stock. Please reorder immediately.`;
      }
      
      // Check if any notification already exists for this product
      const existingNotification = existingNotifications.find(notification => 
        notification.type === 'low_stock' && 
        notification.relatedItemId === product.id
      );
      
      // IMPROVED LOGIC: Only create new notifications in specific circumstances
      if (!existingNotification) {
        // Case 1: No notification exists for this product yet
        console.log(`Creating first notification for product ${product.name}`);
        
        const notification: Omit<Notification, 'id'> = {
          type: 'low_stock',
          title,
          message,
          priority,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedItemId: product.id,
          actionLink: '/inventory'
        };
        
        await addNotification(notification);
        notificationsCreated++;
        console.log(`Created new notification for product ${product.name} (${product.quantity} in stock)`);
      } else if (
        // Case 2: Important status change (out of stock) and notification doesn't reflect that yet
        product.quantity <= 0 && 
        existingNotification.title !== 'Out of Stock Alert'
      ) {
        console.log(`Updating notification for ${product.name} - now out of stock`);
        
        const updatedNotification: Notification = {
          ...existingNotification,
          title,
          message,
          priority,
          isRead: false, // Reset read status because it's an important update
          createdAt: new Date().toISOString()
        };
        
        await updateNotification(updatedNotification);
        notificationsCreated++;
        console.log(`Updated notification for product ${product.name} to out of stock`);
      } else {
        // In all other cases, keep the existing notification but don't create duplicates
        console.log(`Skipping notification for ${product.name} - existing notification already up to date ${existingNotification.id}`);
      }
    }
    
    // Fetch updated notifications to return accurate count
    const allNotifications = await getNotifications();
    const unreadCount = allNotifications.filter(n => !n.isRead).length;
    console.log(`Total unread notifications after processing: ${unreadCount}`);
    
    return notificationsCreated;
  } catch (error) {
    console.error('Error generating low stock notifications:', error);
    return 0;
  }
}

// Add a helper function to clean up notifications
async function cleanupExistingNotifications(): Promise<void> {
  try {
    const notifications = await getNotifications();
    
    // Track unique product IDs to keep only the most recent notification per product
    const seenProductIds = new Set<number>();
    const duplicatesToRemove: number[] = [];
    const readNotificationsToRemove: number[] = [];
    
    // Sort by date (newest first) to process newest notifications first
    notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .forEach(notification => {
        // Remove old read notifications (over 7 days old)
        const notificationDate = new Date(notification.createdAt);
        const daysOld = (Date.now() - notificationDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (notification.isRead && daysOld > 7) {
          readNotificationsToRemove.push(notification.id);
          return;
        }
        
        // Handle low stock notifications - keep only one per product
        if (notification.type === 'low_stock' && notification.relatedItemId) {
          if (seenProductIds.has(notification.relatedItemId)) {
            // We already have a newer notification for this product
            duplicatesToRemove.push(notification.id);
          } else {
            seenProductIds.add(notification.relatedItemId);
          }
        }
      });
    
    // Remove duplicate notifications
    for (const id of duplicatesToRemove) {
      await deleteNotification(id);
      console.log(`Removed duplicate notification: ${id}`);
    }
    
    // Remove old read notifications
    for (const id of readNotificationsToRemove) {
      await deleteNotification(id);
      console.log(`Removed old read notification: ${id}`);
    }
    
    const totalRemoved = duplicatesToRemove.length + readNotificationsToRemove.length;
    if (totalRemoved > 0) {
      console.log(`Cleaned up ${totalRemoved} notifications (${duplicatesToRemove.length} duplicates, ${readNotificationsToRemove.length} old read)`);
    }
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  }
}

// Add a special function to completely reset notification state
export async function forceResetAllNotifications(): Promise<boolean> {
  try {
    console.log('Force resetting all notifications');
    
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      try {
        // First, get all notifications
        const transaction = db.transaction(['notifications'], 'readwrite');
        const store = transaction.objectStore('notifications');
        
        // Clear the store completely
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          console.log('Successfully cleared all notifications');
          resolve(true);
        };
        
        clearRequest.onerror = (event) => {
          console.error('Error clearing notifications:', event);
          reject(false);
        };
      } catch (err) {
        console.error('Error in transaction:', err);
        reject(false);
      }
    });
  } catch (error) {
    console.error('Error in forceResetAllNotifications:', error);
    return false;
  }
} 