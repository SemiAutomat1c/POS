export const mockProducts = [
  {
    id: 'p1',
    name: 'Smartphone X',
    price: 599.99,
    stock: 5,
    category: 'Phones',
  }
];

export const mockSales = [
  {
    id: 'sale1',
    items: [
      {
        productId: 'p1',
        quantity: 1,
        price: 599.99,
        subtotal: 599.99,
      }
    ],
    total: 599.99,
    timestamp: '5/11/2025, 2:14:07 PM',
    status: 'completed',
  }
];

export const mockCustomers = [
  {
    id: 'c1',
    name: 'Walk-in',
    email: 'walk-in@example.com',
    totalPurchases: 599.99,
    lastPurchase: '5/11/2025, 2:14:07 PM',
  }
]; 