import { initializeDB } from './db-adapter';

// This function will be called once when the app starts
export async function initDatabase() {
  try {
    console.log('===== DATABASE INITIALIZATION =====');
    
    // Check for Vercel environment
    const isVercel = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
    console.log(`Environment: ${isVercel ? 'Vercel Production' : 'Local Development'}`);
    
    if (isVercel) {
      // Check and log status of critical environment variables
      const pgVars = [
        'POSTGRES_URL',
        'POSTGRES_HOST',
        'POSTGRES_USER',
        'POSTGRES_PASSWORD',
        'POSTGRES_DATABASE'
      ];
      
      let missingVars: string[] = [];
      
      pgVars.forEach(varName => {
        const exists = process.env[varName] !== undefined;
        console.log(`${varName} exists: ${exists ? 'Yes' : 'No'}`);
        if (!exists) missingVars.push(varName);
      });
      
      if (missingVars.length > 0) {
        throw new Error(`Missing required Postgres environment variables: ${missingVars.join(', ')}`);
      }
    }
    
    // Initialize the database
    console.log('Calling database initialization function...');
    await initializeDB();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    // Rethrow the error for proper handling in the component
    throw error;
  }
} 