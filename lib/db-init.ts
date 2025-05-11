import { initializeDB } from './db-adapter';

// This function will be called once when the app starts
export async function initDatabase() {
  try {
    console.log('Initializing database...');
    await initializeDB();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
} 