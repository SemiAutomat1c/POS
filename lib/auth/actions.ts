'use client';

import { supabase } from '@/lib/storage/supabase';
import { redirect } from 'next/navigation';

/**
 * Logs out the current user and redirects to the login page
 */
export async function logout() {
  try {
    await supabase.auth.signOut();
    // Force a hard refresh to clear any cached states
    window.location.href = '/login';
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

/**
 * Checks if the user is authenticated
 * @returns boolean indicating authentication status
 */
export async function isAuthenticated() {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
} 