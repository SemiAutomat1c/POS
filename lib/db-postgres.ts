import { sql } from '@vercel/postgres';
import { Notification } from './models/Notification';
import type { Product } from './models/Product';
import type { Customer } from './models/Customer';
import type { Sale } from './models/Sale';
import type { Return, StoreCredit } from './models/Return';

// Log environment variable status (without exposing sensitive information)
console.log('PostgreSQL Module Loaded');
console.log('Checking Postgres Environment Variables:');
console.log('POSTGRES_URL exists:', typeof process.env.POSTGRES_URL === 'string');
console.log('POSTGRES_USER exists:', typeof process.env.POSTGRES_USER === 'string');
console.log('POSTGRES_HOST exists:', typeof process.env.POSTGRES_HOST === 'string');
console.log('POSTGRES_PASSWORD exists:', typeof process.env.POSTGRES_PASSWORD ? 'Yes' : 'No');
console.log('POSTGRES_DATABASE exists:', typeof process.env.POSTGRES_DATABASE === 'string');
console.log('NEXT_PUBLIC_VERCEL_ENV:', process.env.NEXT_PUBLIC_VERCEL_ENV);

// Validate the SQL client can connect
async function validateConnection() {
  try {
    const result = await sql`SELECT 1 as connection_test`;
    console.log('PostgreSQL connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('PostgreSQL connection test failed:', error);
    return false;
  }
}

// Initialize database tables if they don't exist
export async function initializeDB() {
  try {
    console.log('PostgreSQL: Attempting to initialize database');
    
    // First check if we can connect
    const canConnect = await validateConnection();
    if (!canConnect) {
      throw new Error('Cannot connect to PostgreSQL database - check connection variables');
    }
    
    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        serialNumber VARCHAR(255) UNIQUE,
        sku VARCHAR(255),
        barcode VARCHAR(255),
        description TEXT,
        cost DECIMAL(10, 2),
        minStockLevel INTEGER DEFAULT 5,
        brand VARCHAR(255),
        model VARCHAR(255),
        color VARCHAR(255),
        storage VARCHAR(255),
        condition VARCHAR(50) DEFAULT 'new',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(255) NOT NULL,
        address TEXT,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create sales table
    await sql`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        customerId INTEGER,
        total DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2),
        tax DECIMAL(10, 2),
        paymentMethod VARCHAR(50),
        paymentStatus VARCHAR(50),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'completed',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create sale_items table
    await sql`
      CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        saleId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unitPrice DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        serialNumber VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (saleId) REFERENCES sales(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      )
    `;

    // Create returns table
    await sql`
      CREATE TABLE IF NOT EXISTS returns (
        id SERIAL PRIMARY KEY,
        originalSaleId INTEGER NOT NULL,
        customerId INTEGER NOT NULL,
        returnDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total DECIMAL(10, 2) NOT NULL,
        reason VARCHAR(255),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        returnType VARCHAR(50) DEFAULT 'refund',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create return_items table
    await sql`
      CREATE TABLE IF NOT EXISTS return_items (
        id SERIAL PRIMARY KEY,
        returnId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        returnedQuantity INTEGER NOT NULL,
        unitPrice DECIMAL(10, 2) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        returnToInventory BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (returnId) REFERENCES returns(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      )
    `;

    // Create store_credits table
    await sql`
      CREATE TABLE IF NOT EXISTS store_credits (
        id SERIAL PRIMARY KEY,
        customerId INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        balance DECIMAL(10, 2) NOT NULL,
        referenceCode VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        expiryDate TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id)
      )
    `;

    // Create notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(50) DEFAULT 'medium',
        isRead BOOLEAN DEFAULT FALSE,
        relatedItemId INTEGER,
        actionLink VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
}

// Product operations
export async function getProducts(): Promise<Product[]> {
  try {
    const { rows } = await sql`SELECT * FROM products`;
    return rows as Product[];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const { rows } = await sql`SELECT * FROM products WHERE id = ${id}`;
    return rows.length > 0 ? rows[0] as Product : null;
  } catch (error) {
    console.error('Error getting product by ID:', error);
    return null;
  }
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<number> {
  try {
    const { rows } = await sql`
      INSERT INTO products (
        name, price, quantity, serialNumber, sku, barcode, description, 
        cost, minStockLevel, brand, model, color, storage, condition
      ) VALUES (
        ${product.name || ''}, 
        ${product.price || 0}, 
        ${product.quantity || 0}, 
        ${product.serialNumber || null}, 
        ${product.sku || null}, 
        ${product.barcode || null}, 
        ${product.description || null}, 
        ${product.cost || null}, 
        ${product.minStockLevel || 5}, 
        ${product.brand || null}, 
        ${product.model || null}, 
        ${product.color || null}, 
        ${product.storage || null}, 
        ${product.condition || 'new'}
      ) RETURNING id
    `;
    return rows[0].id as number;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export async function updateProduct(product: Product): Promise<void> {
  try {
    await sql`
      UPDATE products SET
        name = ${product.name || ''},
        price = ${product.price || 0},
        quantity = ${product.quantity || 0},
        serialNumber = ${product.serialNumber || null},
        sku = ${product.sku || null},
        barcode = ${product.barcode || null},
        description = ${product.description || null},
        cost = ${product.cost || null},
        minStockLevel = ${product.minStockLevel || 5},
        brand = ${product.brand || null},
        model = ${product.model || null},
        color = ${product.color || null},
        storage = ${product.storage || null},
        condition = ${product.condition || 'new'},
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ${product.id}
    `;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Notification operations
export async function getNotifications(): Promise<Notification[]> {
  try {
    const { rows } = await sql`SELECT * FROM notifications ORDER BY createdAt DESC`;
    return rows as Notification[];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

export async function getUnreadNotifications(): Promise<Notification[]> {
  try {
    const { rows } = await sql`SELECT * FROM notifications WHERE isRead = false ORDER BY createdAt DESC`;
    return rows as Notification[];
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return [];
  }
}

export async function getNotificationById(id: number): Promise<Notification | null> {
  try {
    const { rows } = await sql`SELECT * FROM notifications WHERE id = ${id}`;
    return rows.length > 0 ? rows[0] as Notification : null;
  } catch (error) {
    console.error('Error getting notification by ID:', error);
    return null;
  }
}

export async function addNotification(notification: Omit<Notification, 'id'>): Promise<Notification | null> {
  try {
    const { rows } = await sql`
      INSERT INTO notifications (
        type, title, message, priority, isRead, relatedItemId, actionLink, createdAt
      ) VALUES (
        ${notification.type},
        ${notification.title},
        ${notification.message},
        ${notification.priority || 'medium'},
        ${notification.isRead || false},
        ${notification.relatedItemId || null},
        ${notification.actionLink || null},
        ${notification.createdAt ? (notification.createdAt instanceof Date ? notification.createdAt.toISOString() : notification.createdAt) : new Date().toISOString()}
      ) RETURNING *
    `;
    return rows[0] as Notification;
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
}

export async function updateNotification(notification: Notification): Promise<Notification | null> {
  try {
    const { rows } = await sql`
      UPDATE notifications SET
        type = ${notification.type},
        title = ${notification.title},
        message = ${notification.message},
        priority = ${notification.priority || 'medium'},
        isRead = ${notification.isRead},
        relatedItemId = ${notification.relatedItemId || null},
        actionLink = ${notification.actionLink || null}
      WHERE id = ${notification.id}
      RETURNING *
    `;
    return rows[0] as Notification;
  } catch (error) {
    console.error('Error updating notification:', error);
    return null;
  }
}

export async function markNotificationAsRead(id: number): Promise<Notification | null> {
  try {
    console.log('postgres-db: Marking notification as read:', id);
    const { rows } = await sql`
      UPDATE notifications SET isRead = true
      WHERE id = ${id} RETURNING *
    `;
    
    if (rows.length === 0) {
      console.error('postgres-db: Notification not found with ID:', id);
      return null;
    }
    
    console.log('postgres-db: Successfully marked notification as read:', id);
    return rows[0] as Notification;
  } catch (error) {
    console.error('postgres-db: Error marking notification as read:', id, error);
    return null;
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    await sql`UPDATE notifications SET isRead = true WHERE isRead = false`;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

export async function deleteNotification(id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM notifications WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

export async function deleteAllNotifications(): Promise<boolean> {
  try {
    await sql`DELETE FROM notifications`;
    return true;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return false;
  }
}

export async function forceResetAllNotifications(): Promise<boolean> {
  try {
    console.log('Force resetting all notifications');
    await sql`DELETE FROM notifications`;
    console.log('All notifications cleared successfully');
    return true;
  } catch (error) {
    console.error('Error in forceResetAllNotifications:', error);
    return false;
  }
}

async function cleanupExistingNotifications(): Promise<void> {
  try {
    console.log('Cleaning up existing notifications');
    
    // Get all notifications
    const notifications = await getNotifications();
    
    // Group notifications by product ID to find duplicates
    const notificationsByProduct: Record<string, Notification[]> = {};
    
    notifications.forEach(notification => {
      if (notification.type === 'low_stock' && notification.relatedItemId !== undefined) {
        const productId = notification.relatedItemId.toString();
        if (!notificationsByProduct[productId]) {
          notificationsByProduct[productId] = [];
        }
        notificationsByProduct[productId].push(notification);
      }
    });
    
    // Find and delete duplicates, keeping only the newest unread notification per product
    for (const [productId, productNotifications] of Object.entries(notificationsByProduct)) {
      if (productNotifications.length > 1) {
        console.log(`Found ${productNotifications.length} notifications for product ${productId}`);
        
        // Sort by creation date, newest first
        const sortedNotifications = [...productNotifications].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // Keep the newest unread notification, or the newest one if all are read
        const unreadNotifications = sortedNotifications.filter(n => !n.isRead);
        const toKeep = unreadNotifications.length > 0 ? unreadNotifications[0] : sortedNotifications[0];
        
        // Delete all others
        for (const notification of sortedNotifications) {
          if (notification.id !== toKeep.id) {
            console.log(`Deleting duplicate notification ${notification.id} for product ${productId}`);
            await deleteNotification(notification.id);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  }
}

export async function generateLowStockNotifications(): Promise<number> {
  try {
    // Start logging for diagnostic purposes
    console.group('🔄 Low Stock Notification Generation');
    console.log('Starting low stock notification check at:', new Date().toISOString());
    
    const products = await getProducts();
    console.log(`Total products in inventory: ${products.length}`);
    
    let notificationsCreated = 0;
    
    // First, get ALL current notifications before cleanup
    const beforeCleanupNotifications = await getNotifications();
    console.log(`Notifications before cleanup: ${beforeCleanupNotifications.length} (${beforeCleanupNotifications.filter(n => !n.isRead).length} unread)`);
    
    // Clean up any stale or duplicate notifications
    await cleanupExistingNotifications();
    
    // Check again after cleanup
    const afterCleanupNotifications = await getNotifications();
    console.log(`Notifications after cleanup: ${afterCleanupNotifications.length} (${afterCleanupNotifications.filter(n => !n.isRead).length} unread)`);
    
    // Find products with low stock or out of stock
    const lowStockProducts = products.filter(product => {
      const threshold = product.minStockLevel || 5;
      return product.quantity <= threshold;
    });
    
    if (lowStockProducts.length === 0) {
      console.log('No products with low stock found');
      console.groupEnd();
      return 0;
    }
    
    console.log(`Found ${lowStockProducts.length} products with low stock:`);
    lowStockProducts.forEach(p => console.log(`- ${p.name}: ${p.quantity} in stock (threshold: ${p.minStockLevel || 5})`));
    
    // Get existing notifications to avoid duplicates
    const existingNotifications = await getNotifications();
    
    // Log notifications by product
    const notifsByProduct: Record<string, Notification[]> = {};
    existingNotifications.filter(n => n.type === 'low_stock').forEach(n => {
      if (n.relatedItemId !== undefined) {
        const itemId = n.relatedItemId.toString();
        if (!notifsByProduct[itemId]) {
          notifsByProduct[itemId] = [];
        }
        notifsByProduct[itemId].push(n);
      }
    });
    
    console.log('Current notification state by product:');
    Object.entries(notifsByProduct).forEach(([productId, notifs]) => {
      if (notifs.length > 0) {
        console.log(`Product ID ${productId}: ${notifs.length} notifications`);
        if (notifs.length > 1) {
          console.warn(`⚠️ Multiple notifications for same product (${productId})`);
        }
      }
    });
    
    // Process each low stock product
    for (const product of lowStockProducts) {
      console.group(`Processing product: ${product.name} (ID: ${product.id})`);
      console.log(`Stock level: ${product.quantity}, Min threshold: ${product.minStockLevel || 5}`);
      
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
      
      console.log(`Existing notification found: ${existingNotification ? 'Yes' : 'No'}`);
      if (existingNotification) {
        console.log(`Existing notification details: ID=${existingNotification.id}, Title="${existingNotification.title}", Message="${existingNotification.message}", Read=${existingNotification.isRead}`);
      }
      
      // IMPROVED LOGIC: Create new notifications in more cases
      if (!existingNotification) {
        // Case 1: No notification exists for this product yet
        console.log(`✅ Creating first notification for product ${product.name}`);
        
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
        
        console.log(`New notification content: Title="${title}", Message="${message}", Priority=${priority}`);
        
        const result = await addNotification(notification);
        console.log(`Notification creation result:`, result ? `Success, ID=${result.id}` : 'Failed');
        
        if (result) {
          notificationsCreated++;
          console.log(`Created new notification for product ${product.name} (${product.quantity} in stock)`);
        }
      } 
      else if (
        // Case 2: Important status change (out of stock) and notification doesn't reflect that yet
        (product.quantity <= 0 && existingNotification.title !== 'Out of Stock Alert') ||
        // Case 3: Stock quantity has changed - create new notification
        (existingNotification.message !== message)
      ) {
        console.log(`✅ Updating notification for ${product.name} - stock changed to ${product.quantity}`);
        
        if (product.quantity <= 0 && existingNotification.title !== 'Out of Stock Alert') {
          console.log(`Status change detected: Product is now out of stock`);
        }
        
        if (existingNotification.message !== message) {
          console.log(`Message change detected:`);
          console.log(`- Old: "${existingNotification.message}"`);
          console.log(`- New: "${message}"`);
        }
        
        // Create a new notification instead of updating the old one
        // This ensures it appears as a new notification in the UI
        const notification: Omit<Notification, 'id'> = {
          type: 'low_stock',
          title,
          message,
          priority,
          isRead: false, // Always mark as unread for new stock changes
          createdAt: new Date().toISOString(),
          relatedItemId: product.id,
          actionLink: '/inventory'
        };
        
        const result = await addNotification(notification);
        console.log(`Notification creation result:`, result ? `Success, ID=${result.id}` : 'Failed');
        
        if (result) {
          notificationsCreated++;
          console.log(`Created new notification for stock change of ${product.name}`);
        }
      } else {
        // In all other cases, keep the existing notification but don't create duplicates
        console.log(`⏭️ Skipping notification for ${product.name} - existing notification already up to date ${existingNotification.id}`);
      }
    }
    
    console.groupEnd();
    return notificationsCreated;
  } catch (error) {
    console.error('Error generating low stock notifications:', error);
    return 0;
  }
}

// Customer operations
export async function getCustomers(): Promise<Customer[]> {
  try {
    const { rows } = await sql`SELECT * FROM customers`;
    return rows as Customer[];
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<number> {
  try {
    const { rows } = await sql`
      INSERT INTO customers (
        name, email, phone, address, notes
      ) VALUES (
        ${customer.name || ''},
        ${customer.email || null},
        ${customer.phone || null},
        ${customer.address || null},
        ${customer.notes || null}
      ) RETURNING id
    `;
    return rows[0].id as number;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
}

export async function updateCustomer(customer: Customer): Promise<void> {
  try {
    await sql`
      UPDATE customers SET
        name = ${customer.name || ''},
        email = ${customer.email || null},
        phone = ${customer.phone || null},
        address = ${customer.address || null},
        notes = ${customer.notes || null},
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ${customer.id}
    `;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

export async function deleteCustomer(id: number): Promise<void> {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}

// Sales operations
export async function getSales(): Promise<Sale[]> {
  try {
    const { rows } = await sql`SELECT * FROM sales`;
    return rows as Sale[];
  } catch (error) {
    console.error('Error getting sales:', error);
    return [];
  }
}

export async function getSaleById(id: number): Promise<Sale | null> {
  try {
    const { rows } = await sql`SELECT * FROM sales WHERE id = ${id}`;
    if (rows.length === 0) return null;
    
    // Get sale items
    const { rows: itemRows } = await sql`SELECT * FROM sale_items WHERE saleId = ${id}`;
    
    // Return combined data
    return {
      ...rows[0],
      items: itemRows
    } as Sale;
  } catch (error) {
    console.error('Error getting sale by ID:', error);
    return null;
  }
}

export async function addSale(sale: Omit<Sale, 'id'>): Promise<number> {
  try {
    // Begin transaction
    await sql`BEGIN`;
    
    // Insert sale
    const { rows } = await sql`
      INSERT INTO sales (
        date, customerId, total, tax, discount, status, notes
      ) VALUES (
        ${sale.date ? (sale.date instanceof Date ? sale.date.toISOString() : sale.date) : new Date().toISOString()},
        ${sale.customerId || null},
        ${sale.total},
        ${sale.tax || 0},
        ${sale.discount || 0},
        ${sale.status || 'completed'},
        ${sale.notes || null}
      ) RETURNING id
    `;
    
    const saleId = rows[0].id;
    
    // Insert sale items if available
    if (sale.items && sale.items.length > 0) {
      for (const item of sale.items) {
        await sql`
          INSERT INTO sale_items (
            saleId, productId, quantity, unitPrice, discount, total, serialNumber
          ) VALUES (
            ${saleId},
            ${item.productId},
            ${item.quantity},
            ${item.price},
            ${item.discount || 0},
            ${item.total},
            ${item.serialNumber || null}
          )
        `;
        
        // Update product quantity
        await sql`
          UPDATE products 
          SET quantity = quantity - ${item.quantity}
          WHERE id = ${item.productId}
        `;
      }
    }
    
    // Commit transaction
    await sql`COMMIT`;
    
    return saleId;
  } catch (error) {
    // Rollback in case of error
    await sql`ROLLBACK`;
    console.error('Error adding sale:', error);
    throw error;
  }
}

export async function updateSale(sale: Sale): Promise<void> {
  try {
    await sql`
      UPDATE sales SET
        date = ${sale.date ? (sale.date instanceof Date ? sale.date.toISOString() : sale.date) : new Date().toISOString()},
        customerId = ${sale.customerId || null},
        total = ${sale.total},
        tax = ${sale.tax || 0},
        discount = ${sale.discount || 0},
        status = ${sale.status},
        notes = ${sale.notes || null},
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ${sale.id}
    `;
  } catch (error) {
    console.error('Error updating sale:', error);
    throw error;
  }
}

export async function deleteSale(id: number): Promise<void> {
  try {
    await sql`DELETE FROM sales WHERE id = ${id}`;
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw error;
  }
}

export async function getSalesByCustomer(customerId: number): Promise<Sale[]> {
  try {
    const { rows } = await sql`SELECT * FROM sales WHERE customerId = ${customerId}`;
    return rows as Sale[];
  } catch (error) {
    console.error('Error getting sales by customer:', error);
    return [];
  }
}

export async function getRecentSales(days: number = 30): Promise<Sale[]> {
  try {
    const { rows } = await sql`
      SELECT * FROM sales 
      WHERE date >= NOW() - INTERVAL '${days} days'
      ORDER BY date DESC
    `;
    return rows as Sale[];
  } catch (error) {
    console.error('Error getting recent sales:', error);
    return [];
  }
}

// Returns operations
export async function getReturns(): Promise<Return[]> {
  try {
    const { rows } = await sql`SELECT * FROM returns`;
    return rows as Return[];
  } catch (error) {
    console.error('Error getting returns:', error);
    return [];
  }
}

export async function getReturnById(id: number): Promise<Return | null> {
  try {
    const { rows } = await sql`SELECT * FROM returns WHERE id = ${id}`;
    if (rows.length === 0) return null;
    
    // Get return items
    const { rows: itemRows } = await sql`SELECT * FROM return_items WHERE returnId = ${id}`;
    
    // Return combined data
    return {
      ...rows[0],
      items: itemRows
    } as Return;
  } catch (error) {
    console.error('Error getting return by ID:', error);
    return null;
  }
}

export async function getReturnsByCustomer(customerId: number): Promise<Return[]> {
  try {
    const { rows } = await sql`SELECT * FROM returns WHERE customerId = ${customerId}`;
    return rows as Return[];
  } catch (error) {
    console.error('Error getting returns by customer:', error);
    return [];
  }
}

export async function getReturnsBySale(saleId: number): Promise<Return[]> {
  try {
    const { rows } = await sql`SELECT * FROM returns WHERE originalSaleId = ${saleId}`;
    return rows as Return[];
  } catch (error) {
    console.error('Error getting returns by sale:', error);
    return [];
  }
}

export async function addReturn(returnData: Omit<Return, 'id'>): Promise<Return> {
  try {
    // Begin transaction
    await sql`BEGIN`;
    
    // Insert return
    const { rows } = await sql`
      INSERT INTO returns (
        originalSaleId, customerId, returnDate, reason, notes, status, returnType, total
      ) VALUES (
        ${returnData.originalSaleId},
        ${returnData.customerId || null},
        ${returnData.returnDate ? (returnData.returnDate instanceof Date ? returnData.returnDate.toISOString() : returnData.returnDate) : new Date().toISOString()},
        ${returnData.reason || null},
        ${returnData.notes || null},
        ${returnData.status || 'pending'},
        ${returnData.returnType || 'refund'},
        ${returnData.refundAmount || 0}
      ) RETURNING *
    `;
    
    const returnId = rows[0].id;
    const createdReturn = rows[0];
    
    // Insert return items if available
    if (returnData.items && returnData.items.length > 0) {
      for (const item of returnData.items) {
        await sql`
          INSERT INTO return_items (
            returnId, productId, quantity, returnedQuantity, returnToInventory
          ) VALUES (
            ${returnId},
            ${item.productId},
            ${item.quantity},
            ${item.returnedQuantity},
            ${item.returnToInventory}
          )
        `;
        
        // Update product quantity if item is returned to inventory
        if (item.returnToInventory) {
          await sql`
            UPDATE products 
            SET quantity = quantity + ${item.returnedQuantity}
            WHERE id = ${item.productId}
          `;
        }
      }
    }
    
    // Commit transaction
    await sql`COMMIT`;
    
    // Get full return with items
    return await getReturnById(returnId) as Return;
  } catch (error) {
    // Rollback in case of error
    await sql`ROLLBACK`;
    console.error('Error adding return:', error);
    throw error;
  }
}

export async function updateReturn(returnData: Return): Promise<Return> {
  try {
    await sql`
      UPDATE returns SET
        status = ${returnData.status},
        notes = ${returnData.notes || null},
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ${returnData.id}
    `;
    
    return await getReturnById(returnData.id) as Return;
  } catch (error) {
    console.error('Error updating return:', error);
    throw error;
  }
}

export async function deleteReturn(id: number): Promise<void> {
  try {
    await sql`DELETE FROM returns WHERE id = ${id}`;
  } catch (error) {
    console.error('Error deleting return:', error);
    throw error;
  }
}

// Store Credit operations
export async function getStoreCredits(): Promise<StoreCredit[]> {
  try {
    const { rows } = await sql`SELECT * FROM store_credits`;
    return rows as StoreCredit[];
  } catch (error) {
    console.error('Error getting store credits:', error);
    return [];
  }
}

export async function getStoreCreditById(id: number): Promise<StoreCredit | null> {
  try {
    const { rows } = await sql`SELECT * FROM store_credits WHERE id = ${id}`;
    return rows.length > 0 ? rows[0] as StoreCredit : null;
  } catch (error) {
    console.error('Error getting store credit by ID:', error);
    return null;
  }
}

export async function getStoreCreditsByCustomer(customerId: number): Promise<StoreCredit[]> {
  try {
    const { rows } = await sql`SELECT * FROM store_credits WHERE customerId = ${customerId}`;
    return rows as StoreCredit[];
  } catch (error) {
    console.error('Error getting store credits by customer:', error);
    return [];
  }
}

export async function updateStoreCredit(storeCredit: StoreCredit): Promise<StoreCredit> {
  try {
    await sql`
      UPDATE store_credits SET
        balance = ${storeCredit.balance},
        status = ${storeCredit.status},
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ${storeCredit.id}
    `;
    
    return await getStoreCreditById(storeCredit.id) as StoreCredit;
  } catch (error) {
    console.error('Error updating store credit:', error);
    throw error;
  }
} 