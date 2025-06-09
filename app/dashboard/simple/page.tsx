'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/storage/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, User, Settings, LogOut, Package, ShoppingCart, Users, BarChart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SimpleDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          return;
        }
        
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto mb-4 animate-spin rounded-full border-b-2 border-primary"></div>
          <h2 className="text-2xl font-semibold mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Please wait while we set things up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 hidden md:block">
        <div className="flex flex-col h-full">
          <div className="py-4 border-b mb-4">
            <h2 className="text-xl font-bold">POS Dashboard</h2>
            <p className="text-sm text-muted-foreground">Simple Mode</p>
          </div>

          <nav className="space-y-2 flex-1">
            <Link href="/dashboard/simple" className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 text-primary">
              <Home size={16} />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/test" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/5">
              <BarChart size={16} />
              <span>Test Page</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/5 cursor-not-allowed opacity-50">
              <Package size={16} />
              <span>Products</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/5 cursor-not-allowed opacity-50">
              <ShoppingCart size={16} />
              <span>Sales</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/5 cursor-not-allowed opacity-50">
              <Users size={16} />
              <span>Customers</span>
            </div>
          </nav>

          <div className="mt-auto pt-4 border-t">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/5">
              <Settings size={16} />
              <span>Settings</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3 py-2 rounded-md hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</h1>
              <p className="text-muted-foreground">Simple dashboard without data fetching</p>
            </div>
            <Button className="md:hidden" variant="outline" onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Not loaded in simple mode</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Not loaded in simple mode</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Not loaded in simple mode</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Not loaded in simple mode</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Database Connection Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    The main dashboard is experiencing database connection issues. This is a simplified
                    version that doesn't try to fetch data from the database.
                  </p>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
                    <h3 className="font-semibold mb-2">Troubleshooting Steps</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Check that your Supabase database is properly set up</li>
                      <li>Verify that all required tables exist: users, stores, products, customers, sales, returns</li>
                      <li>Ensure your database has the correct Row Level Security (RLS) policies</li>
                      <li>Visit the test page for more detailed diagnostics</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <Button asChild variant="outline">
                      <Link href="/dashboard/test">Go to Diagnostic Test Page</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 