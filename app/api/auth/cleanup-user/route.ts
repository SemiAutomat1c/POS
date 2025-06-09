import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, username } = await request.json();
    
    if (!email && !username) {
      return NextResponse.json(
        { error: 'Email or username is required' },
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

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let cleanupAttempted = false;
    let cleanupSuccess = false;
    let cleanupMessages = [];
    
    // Try to clean up users table first
    try {
      if (email) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, store_id')
          .eq('email', email);
        
        if (!userError && userData && userData.length > 0) {
          cleanupAttempted = true;
          
          // Delete from users table
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('email', email);
          
          if (!deleteError) {
            cleanupSuccess = true;
            cleanupMessages.push('Deleted user record');
            
            // Try to delete associated store
            for (const user of userData) {
              if (user.store_id) {
                const { error: storeError } = await supabase
                  .from('stores')
                  .delete()
                  .eq('id', user.store_id);
                
                if (!storeError) {
                  cleanupMessages.push(`Deleted store with ID: ${user.store_id}`);
                }
              }
            }
          }
        }
      }
      
      if (username) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, store_id')
          .eq('username', username);
        
        if (!userError && userData && userData.length > 0) {
          cleanupAttempted = true;
          
          // Delete from users table
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('username', username);
          
          if (!deleteError) {
            cleanupSuccess = true;
            cleanupMessages.push('Deleted user record by username');
            
            // Try to delete associated store
            for (const user of userData) {
              if (user.store_id) {
                const { error: storeError } = await supabase
                  .from('stores')
                  .delete()
                  .eq('id', user.store_id);
                
                if (!storeError) {
                  cleanupMessages.push(`Deleted store with ID: ${user.store_id}`);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up database records:', error);
    }
    
    // Try to clean up auth users if we have service role key
    if (supabaseServiceKey) {
      try {
        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
        
        if (authUsers && authUsers.users) {
          let authUserFound = false;
          
          // Find matching users
          for (const user of authUsers.users) {
            if ((email && user.email === email) || 
                (username && user.user_metadata?.username === username)) {
              authUserFound = true;
              cleanupAttempted = true;
              
              // Delete the auth user
              await adminSupabase.auth.admin.deleteUser(user.id);
              cleanupSuccess = true;
              cleanupMessages.push(`Deleted auth user with ID: ${user.id}`);
            }
          }
          
          if (!authUserFound && email) {
            // Try a more exhaustive search through user_metadata
            for (const user of authUsers.users) {
              if (user.user_metadata && 
                  (user.user_metadata.email === email || 
                   user.user_metadata.preferred_email === email)) {
                authUserFound = true;
                cleanupAttempted = true;
                
                // Delete the auth user
                await adminSupabase.auth.admin.deleteUser(user.id);
                cleanupSuccess = true;
                cleanupMessages.push(`Deleted auth user with ID: ${user.id} (found in metadata)`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error cleaning up auth users:', error);
      }
    }
    
    if (!cleanupAttempted) {
      return NextResponse.json({
        success: false,
        message: 'No matching users found to clean up'
      });
    }
    
    if (cleanupSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Cleanup completed successfully',
        details: cleanupMessages
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Attempted cleanup but no records were deleted',
        details: cleanupMessages
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