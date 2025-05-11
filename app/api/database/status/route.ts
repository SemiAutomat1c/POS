import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables (without exposing actual values)
    const environmentStatus = {
      NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV || 'not set',
      POSTGRES_URL: typeof process.env.POSTGRES_URL === 'string',
      POSTGRES_HOST: typeof process.env.POSTGRES_HOST === 'string',
      POSTGRES_USER: typeof process.env.POSTGRES_USER === 'string',
      POSTGRES_PASSWORD: typeof process.env.POSTGRES_PASSWORD === 'string',
      POSTGRES_DATABASE: typeof process.env.POSTGRES_DATABASE === 'string',
    };

    // Test database connection
    let connectionStatus = 'unknown';
    let error = null;

    try {
      // Try to connect to the database
      const result = await sql`SELECT 1 as connection_test`;
      connectionStatus = 'connected';
    } catch (err) {
      connectionStatus = 'failed';
      error = err instanceof Error ? err.message : String(err);
    }

    // Return status
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
      databaseType: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 'Postgres' : 'IndexedDB',
      environmentVariables: environmentStatus,
      connectionStatus,
      error,
    });
  } catch (error) {
    console.error('Error in database status API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check database status',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 