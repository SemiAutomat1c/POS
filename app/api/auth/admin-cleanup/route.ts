import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, username, admin_key } = await request.json();
    
    // Basic security check - require an admin key
    const expected_admin_key = process.env.ADMIN_CLEANUP_KEY || 'admin-cleanup-key';
    if (admin_key !== expected_admin_key) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create clients
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let adminSupabase = null;
    
    if (supabaseServiceKey) {
      adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
    } else {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      );
    }
    
    // Direct SQL query to find and delete the user from auth.users
    try {
      // First, get the user ID from auth.users
      const { data: userData, error: userError } = await adminSupabase.rpc('get_user_id_by_email', { 
        user_email: email 
      });
      
      if (userError) {
        console.error('Error getting user ID:', userError);
        return NextResponse.json({
          success: false,
          error: `Failed to get user ID: ${userError.message}`
        });
      }
      
      if (!userData) {
        return NextResponse.json({
          success: false,
          message: 'No user found with this email'
        });
      }
      
      // Now delete the user using the admin API
      const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userData);
      
      if (deleteError) {
        return NextResponse.json({
          success: false,
          error: `Failed to delete user: ${deleteError.message}`
        });
      }
      
      // Also clean up any database records
      try {
        // Clean up users table
        await supabase.from('users').delete().eq('email', email);
        
        // Clean up stores table if needed
        // This would require finding the store_id first
      } catch (dbError) {
        console.error('Error cleaning up database:', dbError);
        // Continue anyway since the auth user is deleted
      }
      
      return NextResponse.json({
        success: true,
        message: `User with email ${email} has been deleted`
      });
      
    } catch (error: any) {
      console.error('Error in admin cleanup:', error);
      return NextResponse.json({
        success: false,
        error: `Admin cleanup failed: ${error.message}`
      });
    }
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: `Request error: ${error.message}` 
      },
      { status: 400 }
    );
  }
} 