export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'Hello from POS API!',
      status: 'online',
      system: 'POS System API',
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
} 