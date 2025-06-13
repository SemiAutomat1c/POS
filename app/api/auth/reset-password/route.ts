import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { password, token } = await request.json();

    if (!password || !token) {
      return NextResponse.json(
        { error: 'Password and reset token are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error('Password update error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error during password update:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 