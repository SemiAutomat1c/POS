import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get the site URL from environment variables or use the request URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
    
    // Generate the reset URL
    const resetUrl = `${siteUrl}/reset-password`;

    // Send the password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${resetUrl}`,
    });

    if (error) {
      console.error('Error sending reset password email:', error);
      return NextResponse.json(
        { error: 'Failed to send reset password email' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: 'Password reset email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in forgot-password route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 