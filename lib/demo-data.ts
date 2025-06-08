// Mock data for the demo dashboard
export const demoProducts = [
  { id: 1, name: 'Smartphone X Pro', sku: 'SP-001', price: 899.99, quantity: 45, category: { name: 'Electronics' } },
  { id: 2, name: 'Wireless Earbuds', sku: 'WE-002', price: 129.99, quantity: 78, category: { name: 'Electronics' } },
  { id: 3, name: 'Smartwatch Elite', sku: 'SW-003', price: 249.99, quantity: 32, category: { name: 'Wearables' } },
  { id: 4, name: 'Laptop Ultra', sku: 'LT-004', price: 1299.99, quantity: 21, category: { name: 'Computers' } },
  { id: 5, name: 'Bluetooth Speaker', sku: 'BS-005', price: 89.99, quantity: 54, category: { name: 'Audio' } },
  { id: 6, name: 'Gaming Console', sku: 'GC-006', price: 499.99, quantity: 18, category: { name: 'Gaming' } },
  { id: 7, name: 'Tablet Pro', sku: 'TB-007', price: 349.99, quantity: 29, category: { name: 'Electronics' } },
  { id: 8, name: 'Wireless Mouse', sku: 'WM-008', price: 49.99, quantity: 62, category: { name: 'Accessories' } },
];

export const demoCustomers = [
  { id: 1, name: 'John Smith', email: 'john.smith@example.com', phone: '(555) 123-4567', total_purchases: 1245.67 },
  { id: 2, name: 'Maria Garcia', email: 'maria.garcia@example.com', phone: '(555) 234-5678', total_purchases: 876.50 },
  { id: 3, name: 'David Johnson', email: 'david.johnson@example.com', phone: '(555) 345-6789', total_purchases: 2345.12 },
  { id: 4, name: 'Sarah Williams', email: 'sarah.williams@example.com', phone: '(555) 456-7890', total_purchases: 543.29 },
  { id: 5, name: 'Michael Brown', email: 'michael.brown@example.com', phone: '(555) 567-8901', total_purchases: 1678.45 },
];

export const demoSales = [
  { id: 1, customer_name: 'John Smith', date: '2023-06-15', total: 499.99, status: 'completed', items: 3 },
  { id: 2, customer_name: 'Maria Garcia', date: '2023-06-14', total: 129.99, status: 'completed', items: 1 },
  { id: 3, customer_name: 'David Johnson', date: '2023-06-13', total: 1299.99, status: 'completed', items: 2 },
  { id: 4, customer_name: 'Sarah Williams', date: '2023-06-12', total: 249.99, status: 'completed', items: 1 },
  { id: 5, customer_name: 'Michael Brown', date: '2023-06-11', total: 939.98, status: 'completed', items: 4 },
  { id: 6, customer_name: 'John Smith', date: '2023-06-10', total: 349.99, status: 'completed', items: 1 },
  { id: 7, customer_name: 'Maria Garcia', date: '2023-06-09', total: 89.99, status: 'completed', items: 1 },
  { id: 8, customer_name: 'David Johnson', date: '2023-06-08', total: 599.98, status: 'completed', items: 2 },
];

export const demoReturns = [
  { id: 1, original_sale_id: 1, customer_name: 'John Smith', date: '2023-06-16', total: 499.99, reason: 'Defective' },
  { id: 2, original_sale_id: 3, customer_name: 'David Johnson', date: '2023-06-14', total: 899.99, reason: 'Incorrect size' },
  { id: 3, original_sale_id: 5, customer_name: 'Michael Brown', date: '2023-06-12', total: 89.99, reason: 'Not as described' },
  { id: 4, original_sale_id: 7, customer_name: 'Maria Garcia', date: '2023-06-10', total: 89.99, reason: 'Changed mind' },
];

// Demo stats 
export const demoStats = {
  totalProducts: 128,
  totalCustomers: 54,
  totalSales: 312,
  totalReturns: 8,
}; 