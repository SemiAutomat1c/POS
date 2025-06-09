# Supabase Migration Guide

This guide will help you migrate your POS application to a new Supabase project.

## Step 1: Create a new Supabase project

1. Log in to Supabase (https://app.supabase.com)
2. Click "New Project"
3. Fill in the details:
   - Organization: Your organization
   - Project name: Choose a descriptive name
   - Database password: Create a secure password
   - Region: Choose the region closest to your users
   - Pricing plan: Free tier or appropriate paid tier

## Step 2: Update environment variables

Update your `.env.local` file with the new Supabase URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=your_new_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:4444
```

## Step 3: Set up database schema

1. Go to the SQL Editor in your Supabase dashboard
2. Run the following SQL scripts in order:
   - `supabase/migrations/20240607_initial_schema.sql` - Creates tables and base schema
   - `supabase/migrations/20240607_rls_policies.sql` - Sets up Row Level Security policies

## Step 4: Configure authentication

1. Go to Authentication > Settings:
   - Set Site URL to `http://localhost:4444` (or your production URL)
   - Add redirect URLs as needed (e.g., `http://localhost:4444/auth/callback`)

2. Go to Authentication > Providers:
   - Enable Email provider
   - Configure email confirmation settings as needed

3. Go to Authentication > Email Templates:
   - Update email templates with your branding

## Step 5: Verify database connection

Test your connection to the new Supabase instance by:
1. Starting your application (`npm run dev`)
2. Attempting to register a new user
3. Verifying the user data is stored in your Supabase database

## Step 6: Data migration (if needed)

If you need to migrate existing data:

1. Export data from your old Supabase project:
   - Use the SQL Editor to export your data as INSERT statements
   - Or use `pg_dump` if you have database access

2. Import data to your new Supabase project:
   - Use the SQL Editor to run your INSERT statements
   - Ensure proper error handling for duplicate records

## Troubleshooting

### Registration issues
- Verify your environment variables are correctly set
- Check Supabase Auth settings and configurations
- Examine browser console for error messages
- Review network requests to identify API errors

### Database connection issues
- Verify RLS policies are correctly configured
- Ensure tables have the correct schema
- Check that the Supabase anon key has appropriate permissions

### Authentication flow problems
- Verify redirect URLs are properly configured
- Check email templates and settings
- Ensure your application is handling auth state correctly

## Recommended Testing Procedure

1. Register a new user via `/direct-register`
2. Sign in with the new user credentials
3. Create a store record
4. Add products and customers
5. Process test sales
6. Verify all functionality works with the new Supabase instance 