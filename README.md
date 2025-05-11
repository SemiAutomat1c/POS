# GadgetTrack POS System

A modern Point of Sale system for gadget retailers with inventory management, customer tracking, and installment payment features.

## Project Structure

This project is built with:
- Next.js frontend
- Redux Toolkit for state management
- IndexedDB for offline data storage
- Tailwind CSS for styling
- TypeScript for type safety

## Key Features

- **Inventory Management**: Track products, categories, and stock levels
- **Customer Management**: Store customer information and purchase history
- **Sales Processing**: Create and manage sales transactions
- **Payment Tracking**: Handle full payments and installment plans
- **Offline Capability**: Full functionality without internet using IndexedDB
- **Responsive Design**: Works on desktop and tablet devices

## Recently Completed

- Consolidated project structure (merged from previous versions)
- Implemented Redux state management integration
- Connected detailed database models with IndexedDB
- Improved UI components with modern design

## Getting Started

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Organization

- `/app`: Next.js app router pages
- `/components`: UI components
- `/lib`: Utilities and database functions
  - `/lib/db.ts`: IndexedDB implementation
  - `/lib/models`: Database model definitions
- `/store`: Redux store configuration
  - `/store/slices`: Redux slices for different data entities

## Development Roadmap

- Complete the Redux implementation for all entity types
- Connect UI components to real data instead of mock data
- Implement full offline sync capabilities
- Add reporting and analytics features

## Features

- 🛍️ **Sales Management**
  - Quick product search and add to cart
  - Multiple payment methods (Cash, Card, GCash)
  - Automatic change calculation
  - Receipt printing
  - Transaction history

- 📦 **Inventory Management**
  - Product catalog
  - Stock tracking
  - Low stock alerts
  - Product categories
  - Barcode support

- 📊 **Dashboard**
  - Sales overview
  - Revenue metrics
  - Expense tracking
  - Real-time updates

- 🎨 **Modern UI**
  - Clean and intuitive interface
  - Responsive design
  - Dark/Light mode support
  - Smooth animations

## Tech Stack

- **Framework:** Next.js 13+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Hooks
- **Database:** Local Storage (can be extended to any database)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 