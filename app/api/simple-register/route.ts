import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { email, password, username, storeName, storeAddress, storePhone } = requestData;

    console.log('Simple registration attempt for:', { email, username, storeName });
    
    // Validate required fields
    if (!email || !password || !username || !storeName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basic validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Initialize Supabase client
    console.log('Initializing Supabase client...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
      // Step 1: Create the store
      console.log('Creating store...');
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([
          {
            name: storeName,
            address: storeAddress || 'Default Address',
            phone: storePhone || '000-000-0000',
            email: email,
            subscription_status: 'trial',
            max_users: 2,
            max_products: 50,
            max_locations: 1
          }
        ])
        .select()
        .single();

      if (storeError) {
        console.error('Store creation error:', storeError);
        return NextResponse.json(
          { error: `Database error: ${storeError.message}` },
          { status: 500 }
        );
      }

      console.log('Store created successfully, ID:', store.id);
      
      // Return success even without creating a user
      // This is just to test if the store creation works
      return NextResponse.json(
        { 
          message: 'Store created successfully',
          store: {
            id: store.id,
            name: storeName
          }
        },
        { status: 200 }
      );
      
    } catch (err: any) {
      console.error('Unexpected error during registration:', err);
      return NextResponse.json(
        { error: `An unexpected error occurred: ${err.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Request parsing error:', error);
    return NextResponse.json(
      { error: `Request error: ${error.message}` },
      { status: 400 }
    );
  }
} 