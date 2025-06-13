import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    // Always return success even if email doesn't exist (for security)
    return NextResponse.json(
      { message: 'Password reset email sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error during password reset:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 