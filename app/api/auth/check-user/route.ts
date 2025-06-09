import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

interface UserRecord {
  id: string;
  email: string;
  username: string;
}

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
    
    // Check if user exists in the public users table
    let existingUsers: UserRecord[] = [];
    let usersError = null;
    
    if (email && username) {
      // Check by email first
      const { data: emailData, error: emailError } = await supabase
        .from('users')
        .select('id, email, username')
        .eq('email', email);
      
      if (emailError) {
        usersError = emailError;
      } else if (emailData && emailData.length > 0) {
        existingUsers = emailData as UserRecord[];
      } else {
        // If not found by email, check by username
        const { data: usernameData, error: usernameError } = await supabase
          .from('users')
          .select('id, email, username')
          .eq('username', username);
        
        if (usernameError) {
          usersError = usernameError;
        } else {
          existingUsers = (usernameData || []) as UserRecord[];
        }
      }
    } else if (email) {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username')
        .eq('email', email);
      
      existingUsers = (data || []) as UserRecord[];
      usersError = error;
    } else {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username')
        .eq('username', username);
      
      existingUsers = (data || []) as UserRecord[];
      usersError = error;
    }
    
    if (usersError) {
      return NextResponse.json(
        { error: `Database error: ${usersError.message}` },
        { status: 500 }
      );
    }
    
    // Check if user exists in auth.users (if we have service role key)
    let authUserExists = false;
    if (supabaseServiceKey && email) {
      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers();
      
      if (!authError && authUsers) {
        authUserExists = authUsers.users.some(user => user.email === email);
      }
    }
    
    return NextResponse.json({
      exists: existingUsers.length > 0 || authUserExists,
      existingUsers: existingUsers.length > 0 ? existingUsers : null,
      authUserExists
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: `Request error: ${error.message}` },
      { status: 400 }
    );
  }
} 