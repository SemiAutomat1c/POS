import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { email, password, username, storeName, storeAddress, storePhone } = requestData;

    console.log('Direct registration attempt for:', { email, username, storeName });
    
    // Validate required fields
    if (!email || !password || !username || !storeName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Basic validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Initialize Supabase client
    console.log('Initializing Supabase client for direct DB operations...');
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

    // COMPLETELY MANUAL APPROACH
    console.log('Using completely manual registration approach...');
    
    try {
      // Step 1: Create the store first
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
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      console.log('Store created successfully, ID:', store.id);
      
      // Step 2: Create auth user directly in the auth.users table
      // Generate a UUID for the user
      const userId = uuidv4();
      
      // Execute raw SQL to insert directly into auth.users
      // This is a workaround for the constraints
      const { error: authError } = await supabase.rpc('create_user_manually', {
        user_id: userId,
        user_email: email,
        user_password: password
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        
        // Cleanup - delete the store
        await supabase.from('stores').delete().match({ id: store.id });
        
        return NextResponse.json(
          { error: `Auth error: ${authError.message}` },
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      console.log('Auth user created successfully, ID:', userId);
      
      // Step 3: Create public user record
      console.log('Creating public user record...');
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            username,
            email,
            hashed_password: hashedPassword,
            role: 'owner',
            store_id: store.id,
            subscription_tier: 'free',
            subscription_status: 'trial',
            trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        ])
        .select()
        .single();

      if (userError) {
        console.error('User creation error:', userError);
        
        // Cleanup - delete the store
        await supabase.from('stores').delete().match({ id: store.id });
        
        return NextResponse.json(
          { error: `Database error: ${userError.message}` },
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      console.log('User created successfully, ID:', user.id);
      
      // Return success
      return NextResponse.json(
        { 
          message: 'Registration successful using manual method',
          user: {
            id: user.id,
            email,
            username
          },
          store: {
            id: store.id,
            name: storeName
          }
        },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
    } catch (err: any) {
      console.error('Unexpected error during registration:', err);
      return NextResponse.json(
        { error: `An unexpected error occurred: ${err.message}` },
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