'use client';

import { useState, useEffect } from 'react';

export default function ApiTestPage() {
  const [getResult, setGetResult] = useState<string | null>(null);
  const [postResult, setPostResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Test GET endpoint
  const testGet = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/test', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('GET Response status:', response.status);
      console.log('GET Response headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('GET Raw response:', text);
      
      let data;
      try {
        data = JSON.parse(text);
        setGetResult(JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('GET JSON parse error:', parseError);
        setError(`Failed to parse GET response: ${text.substring(0, 100)}`);
      }
    } catch (err: any) {
      console.error('GET request error:', err);
      setError(err.message || 'Failed to test GET endpoint');
    } finally {
      setLoading(false);
    }
  };

  // Test POST endpoint
  const testPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ test: 'data', timestamp: new Date().toISOString() })
      });

      console.log('POST Response status:', response.status);
      console.log('POST Response headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('POST Raw response:', text);
      
      let data;
      try {
        data = JSON.parse(text);
        setPostResult(JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('POST JSON parse error:', parseError);
        setError(`Failed to parse POST response: ${text.substring(0, 100)}`);
      }
    } catch (err: any) {
      console.error('POST request error:', err);
      setError(err.message || 'Failed to test POST endpoint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test GET Request</h2>
        <button
          onClick={testGet}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test GET /api/test'}
        </button>
        
        {getResult && (
          <div className="mt-4">
            <h3 className="font-medium">GET Response:</h3>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto max-h-40">
              {getResult}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test POST Request</h2>
        <button
          onClick={testPost}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test POST /api/test'}
        </button>
        
        {postResult && (
          <div className="mt-4">
            <h3 className="font-medium">POST Response:</h3>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto max-h-40">
              {postResult}
            </pre>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-800 rounded">
          <h3 className="font-medium">Error:</h3>
          <p className="mt-1">{error}</p>
        </div>
      )}
    </div>
  );
} 