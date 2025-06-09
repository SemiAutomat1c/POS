# GadgetTrack POS System

A modern Point of Sale system for gadget retailers with inventory management, customer tracking, and installment payment features. Now available as a Progressive Web App (PWA) for installation on any device!

## Project Structure

This project is built with:
- Next.js frontend
- Redux Toolkit for state management
- IndexedDB for offline data storage
- Tailwind CSS for styling
- TypeScript for type safety
- PWA support for cross-platform installation

## Key Features

- **Inventory Management**: Track products, categories, and stock levels
- **Customer Management**: Store customer information and purchase history
- **Sales Processing**: Create and manage sales transactions
- **Payment Tracking**: Handle full payments and installment plans
- **Offline Capability**: Full functionality without internet using IndexedDB
- **Responsive Design**: Works on desktop and tablet devices
- **Cross-Platform Installation**: Install and use as a native app on iOS, Android, and desktop devices

## PWA Capabilities

GadgetTrack is now a full Progressive Web App (PWA) that can be installed on:

- **iOS Devices**: iPhones and iPads via Safari's "Add to Home Screen"
- **Android Devices**: Phones and tablets through Chrome's installation feature
- **Desktop Computers**: Windows, macOS, and Linux through Chrome, Edge, or other modern browsers

Key PWA features include:
- Offline functionality with service worker caching
- Home screen installation
- App-like experience without browser chrome
- Fast loading and performance
- Automatic updates

## Installation Guide

Our landing page now features a comprehensive installation guide for all platforms:

### iOS Installation
1. Open Safari and navigate to the app
2. Tap the Share button
3. Select "Add to Home Screen"

### Android Installation
1. Open Chrome and navigate to the app
2. Tap the menu (three dots)
3. Select "Install App" or "Add to Home Screen"

### Desktop Installation
1. Open Chrome or Edge and navigate to the app
2. Look for the install icon in the address bar
3. Click "Install" and follow the prompts

## Recently Completed

- Added full PWA support with offline capabilities
- Created cross-platform installation guides
- Implemented service worker for background sync
- Added manifest.json for app configuration
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

3. Open [http://localhost:4444](http://localhost:4444) in your browser

## Project Organization

- `/app`: Next.js app router pages
- `/components`: UI components
- `/lib`: Utilities and database functions
  - `/lib/db.ts`: IndexedDB implementation
  - `/lib/models`: Database model definitions
- `/store`: Redux store configuration
  - `/store/slices`: Redux slices for different data entities
- `/public`: Static assets and PWA files
  - `/public/manifest.json`: PWA manifest configuration
  - `/public/icons`: App icons for different platforms
  - `/public/sw.js`: Service worker for offline functionality

## Development Roadmap

- Enhance offline sync capabilities
- Add reporting and analytics features
- Implement push notifications for important alerts
- Complete the Redux implementation for all entity types
- Connect UI components to real data instead of mock data

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

- 📱 **Cross-Platform**
  - Install on iOS devices
  - Install on Android devices
  - Install on desktop computers
  - Offline functionality
  - Responsive design for all screen sizes

## Tech Stack

- **Framework:** Next.js 13+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Hooks and Redux Toolkit
- **Database:** Local Storage and IndexedDB
- **PWA:** next-pwa with Workbox

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 