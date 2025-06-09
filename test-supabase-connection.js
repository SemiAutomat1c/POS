// Supabase Connection Test Script
// Run with: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('=== Supabase Connection Test ===');
  
  // Get credentials from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase credentials in .env.local file');
    console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
    process.exit(1);
  }
  
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Testing connection...`);
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test database connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact' })
      .limit(1);
      
    if (error) {
      throw error;
    }
    
    console.log('✅ Successfully connected to Supabase database!');
    console.log(`Database query result:`, data);
    
    // Test auth API
    console.log('\nTesting Auth API...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      throw authError;
    }
    
    console.log('✅ Successfully connected to Supabase Auth API!');
    console.log(`Current session:`, authData.session ? 'Active' : 'None');
    
    console.log('\n=== All tests passed! ===');
    console.log('Your Supabase configuration is working correctly.');
    
  } catch (error) {
    console.error('❌ Connection test failed!');
    console.error('Error details:', error);
    process.exit(1);
  }
}

testSupabaseConnection().catch(console.error); 