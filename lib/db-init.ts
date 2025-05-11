import { initializeDB } from './db-adapter';

// This function will be called once when the app starts
export async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Check if we're in a Vercel environment
    const isVercel = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
    console.log(`Environment: ${isVercel ? 'Vercel Production' : 'Local Development'}`);
    
    if (isVercel) {
      // On Vercel, verify Postgres environment variables exist
      const pgUrl = process.env.POSTGRES_URL;
      if (!pgUrl) {
        console.error('Missing POSTGRES_URL environment variable in production');
        throw new Error('Missing required database configuration. Check Vercel environment variables.');
      }
      console.log('Postgres configuration detected');
    }
    
    const result = await initializeDB();
    console.log('Database initialized successfully');
    return result;
  } catch (error) {
    console.error('Error initializing database:', error);
    // Rethrow to allow the component to handle the error
    throw error;
  }
} 