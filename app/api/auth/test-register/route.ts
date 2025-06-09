import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { email, password, username, storeName } = requestData;

    console.log('Test registration attempt for:', { email, username, storeName });
    
    // Validate required fields
    if (!email || !password || !username || !storeName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simply return success response for testing
    console.log('Test registration completed successfully');
    return NextResponse.json(
      { 
        message: 'Registration successful',
        user: {
          id: 'test-user-id',
          email,
          username
        },
        store: {
          id: 'test-store-id',
          name: storeName
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Request parsing error:', error);
    return NextResponse.json(
      { error: `Request error: ${error.message}` },
      { status: 400 }
    );
  }
} 