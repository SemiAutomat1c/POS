import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    console.log('Testing auth signup for:', email);
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try simple signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('Test signup error:', {
        code: error.code,
        message: error.message,
        details: error
      });
      
      return NextResponse.json(
        { error: `Auth error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Test signup successful',
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at
        } : null
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: `Error: ${error.message}` },
      { status: 500 }
    );
  }
} 