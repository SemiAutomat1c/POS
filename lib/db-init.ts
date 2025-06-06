import { initializeDB } from './db-adapter';

// This function will be called once when the app starts
export async function initDatabase() {
  try {
    console.log('===== DATABASE INITIALIZATION =====');
    
    // Initialize IndexedDB
    console.log('Initializing IndexedDB...');
    await initializeDB();
    console.log('IndexedDB initialized successfully');
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    // Rethrow the error for proper handling in the component
    throw error;
  }
} 