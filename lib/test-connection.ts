import { supabase } from './storage/supabase'

export async function testSupabaseConnection() {
  try {
    // Test the connection by making a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single()

    if (error) {
      console.error('Supabase connection test failed:', error.message)
      return false
    }

    console.log('Supabase connection test successful!')
    return true
  } catch (error) {
    console.error('Error testing Supabase connection:', error)
    return false
  }
} 