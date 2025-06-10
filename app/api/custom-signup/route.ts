import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';

// Initialize Supabase client with public anon key (for deployment)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    // Parse request body
    const { email, password, firstName, lastName, storeName } = await request.json();
    
    console.log('Received signup request:', { email, firstName, lastName, storeName });
    
    if (!email || !password || !storeName) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Start a transaction
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert([
        { name: storeName }
      ])
      .select('id')
      .single();
    
    if (storeError) {
      console.error('Error creating store:', storeError);
      return NextResponse.json({ 
        error: 'Failed to create store',
        details: storeError
      }, { status: 500 });
    }
    
    // Create the user record directly
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        { 
          email,
          password_hash: hashedPassword, 
          first_name: firstName,
          last_name: lastName,
          store_id: store.id,
          role: 'owner'
        }
      ])
      .select('id, email, role')
      .single();
    
    if (userError) {
      console.error('Error creating user:', userError);
      
      // Clean up the store if user creation fails
      await supabase
        .from('stores')
        .delete()
        .eq('id', store.id);
        
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: userError
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      store: {
        id: store.id
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      error: 'Registration failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 