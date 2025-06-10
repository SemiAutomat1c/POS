import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { email, password, username, storeName, storeAddress, storePhone } = requestData;

    console.log('Auth signup attempt for:', { email, username, storeName });
    
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

    // Initialize Supabase client
    console.log('Initializing Supabase client...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
      // First, sign up with Supabase Auth to get the user
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role: 'owner'
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        return NextResponse.json(
          { error: `Auth error: ${authError.message}` },
          { status: 500 }
        );
      }

      if (!authData.user) {
        console.error('No user returned from Auth API');
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      console.log('Auth user created:', authData.user.id);

      // Check if the trigger created the public user
      const { data: publicUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching public user:', fetchError);
      }
        
      if (!publicUser) {
        console.log('No public user found, creating manually...');
        
        // Create public user record manually
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            username,
            email,
            hashed_password: '**hashed**', // Password is stored in auth.users
            role: 'owner',
            subscription_tier: 'free',
            subscription_status: 'trial'
          });
          
        if (userError) {
          console.error('Error creating public user:', userError);
          return NextResponse.json(
            { error: `Database error: ${userError.message}` },
            { status: 500 }
          );
        }
      }
      
      // Create the store
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

      // Update the user with the store ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ store_id: store.id })
        .eq('id', authData.user.id);
        
      if (updateError) {
        console.error('Error updating user with store ID:', updateError);
        // Continue anyway
      }

      return NextResponse.json(
        { 
          message: 'Registration successful',
          user: {
            id: authData.user.id,
            email,
            username
          },
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