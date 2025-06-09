import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'API is working' },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function POST(request: Request) {
  try {
    // Log request info
    console.log('Test POST request received');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    // Try to parse JSON body if exists
    let body = {};
    
    try {
      const text = await request.text();
      console.log('Raw request body:', text);
      
      if (text.trim()) {
        body = JSON.parse(text);
      }
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Return successful response
    return NextResponse.json(
      { 
        message: 'Test endpoint working correctly',
        receivedData: body
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 