import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Initialize database tables
async function initializeTables() {
  try {
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
        phone VARCHAR(255),
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
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    return true;
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
}

export async function GET() {
  try {
    // Check environment variables
    const pgUrl = process.env.POSTGRES_URL;
    if (!pgUrl) {
      return NextResponse.json({
        success: false,
        error: 'Missing POSTGRES_URL environment variable'
      }, { status: 500 });
    }

    // Initialize tables
    await initializeTables();

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in database initialization API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize database',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 