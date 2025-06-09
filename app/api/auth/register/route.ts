import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Define types to match database schema
type UserRole = 'owner' | 'admin' | 'staff';
type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';
type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired';

export async function POST(request: Request) {
  try {
    // Log request details
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const requestData = await request.json();
    const { email, password, username, storeName, storeAddress, storePhone, subscriptionTier = 'free' } = requestData;

    // Validate subscription tier
    const validTiers: SubscriptionTier[] = ['free', 'basic', 'premium', 'enterprise'];
    const tier: SubscriptionTier = validTiers.includes(subscriptionTier as SubscriptionTier) 
      ? (subscriptionTier as SubscriptionTier) 
      : 'free';

    console.log('Registration attempt for:', { email, username, storeName, subscriptionTier: tier });
    
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
    console.log('Initializing Supabase client...');
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

    // APPROACH: Try direct signup
    console.log('Attempting direct signup...');
    
    try {
      // Set up store limits based on subscription tier
      let maxUsers = 2;
      let maxProducts = 50;
      let maxLocations = 1;
      
      // Adjust limits based on the subscription tier
      switch (tier) {
        case 'basic':
          maxUsers = 5;
          maxProducts = 200;
          maxLocations = 2;
          break;
        case 'premium':
          maxUsers = 10;
          maxProducts = 1000;
          maxLocations = 5;
          break;
        case 'enterprise':
          maxUsers = 25;
          maxProducts = 5000;
          maxLocations = 10;
          break;
        default: // 'free' tier or any invalid value
          // Use default values set above
          break;
      }
      
      // Create store with the user's information
      console.log('Creating store with tier:', tier);
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([
          {
            name: storeName,
            address: storeAddress || 'Default Address',
            phone: storePhone || '000-000-0000',
            email: email,
            subscription_status: 'trial',
            subscription_tier: tier,
            max_users: maxUsers,
            max_products: maxProducts,
            max_locations: maxLocations
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
      
      // Directly sign up the user - with email autoconfirm option
      console.log('Signing up user with email:', email);
      
      try {
        // Try with autoconfirm option
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
            data: {
              username,
              store_id: store.id
            }
          }
        });

        if (authError) {
          console.error('Signup error details:', {
            code: authError.code,
            message: authError.message,
            details: authError
          });
          
          // Clean up the store
          await supabase.from('stores').delete().match({ id: store.id });
          
          return NextResponse.json(
            { error: `Authentication error: ${authError.message}` },
            { 
              status: 500,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }

        if (!authData?.user) {
          console.error('No user data returned from signup');
          await supabase.from('stores').delete().match({ id: store.id });
          return NextResponse.json(
            { error: 'Failed to create user account' },
            { 
              status: 500,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
        
        console.log('Auth signup successful:', {
          id: authData.user.id,
          email: authData.user.email,
          emailConfirmed: authData.user.email_confirmed_at ? 'Yes' : 'No'
        });

        // Create public user record with auth ID
        console.log('Creating public user record with tier:', tier);
        
        // Log the insert data for debugging
        console.log('User insert data:', {
          id: authData.user.id,
          username,
          email,
          hashed_password: hashedPassword, // Using snake_case to match SQL schema
          role: 'owner',
          store_id: store.id, // Using snake_case to match SQL schema
          subscription_tier: tier, // Using snake_case to match SQL schema
          subscription_status: 'trial', // Using snake_case to match SQL schema
        });
        
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              username,
              email,
              hashed_password: hashedPassword, // Ensure this matches the column name in the database
              role: 'owner',
              store_id: store.id, // Using snake_case to match SQL schema
              subscription_tier: tier, // Using snake_case to match SQL schema
              subscription_status: 'trial', // Using snake_case to match SQL schema
              trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Using snake_case to match SQL schema
            }
          ]);

        if (userError) {
          console.error('Public user creation error:', {
            message: userError.message,
            details: userError.details,
            hint: userError.hint,
            code: userError.code
          });
          
          // Cleanup attempt - this is best effort
          try {
            await supabase.from('stores').delete().match({ id: store.id });
            // We can't delete the auth user with the regular client
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
          
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

        console.log('Registration completed successfully');
        
        // Return appropriate response based on email confirmation status
        if (authData.user.email_confirmed_at === null && authData.user.confirmation_sent_at !== null) {
          return NextResponse.json(
            { 
              message: 'Registration successful - please check your email to confirm your account',
              user: {
                id: authData.user.id,
                email,
                username
              },
              store: {
                id: store.id,
                name: storeName,
                subscription_tier: tier
              },
              requiresEmailConfirmation: true
            },
            { 
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        } else {
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
                name: storeName,
                subscription_tier: tier
              }
            },
            { 
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
      } catch (signupError) {
        console.error('Unexpected error during auth.signUp:', signupError);
        // Clean up the store
        await supabase.from('stores').delete().match({ id: store.id });
        
        return NextResponse.json(
          { error: `Authentication error: ${signupError instanceof Error ? signupError.message : 'Unknown error'}` },
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (err) {
      console.error('Unexpected error during registration:', err);
      return NextResponse.json(
        { error: 'An unexpected error occurred during registration' },
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
    // Return a valid JSON response even for parsing errors
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