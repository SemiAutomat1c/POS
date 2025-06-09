import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { email, password, username } = requestData;

    console.log('Test Auth Registration attempt for:', { email, username });
    
    // Initialize Supabase client
    console.log('Initializing Supabase client for auth test...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test only the auth.signUp part
    console.log('Testing ONLY auth.signUp with:', { email });
    
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (error) {
        console.error('Auth signup error:', {
          message: error.message,
          code: error.code,
          details: error
        });
        
        return NextResponse.json(
          { error: `Auth error: ${error.message}` },
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      console.log('Auth signup success:', {
        id: data.user?.id,
        email: data.user?.email
      });
      
      return NextResponse.json(
        { 
          message: 'Auth signup successful',
          user: data.user ? {
            id: data.user.id,
            email: data.user.email
          } : null
        },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (signupError) {
      console.error('Unexpected error during auth.signUp:', signupError);
      
      return NextResponse.json(
        { error: `Auth error: ${signupError instanceof Error ? signupError.message : 'Unknown error'}` },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (error: any) {
    console.error('Request parsing error:', error);
    return NextResponse.json(
      { error: `Request error: ${error.message}` },
      { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 