// This script outputs the commands to set up your Vercel environment variables
console.log('Run the following commands one by one:');
console.log('------------------------------------');
console.log('vercel env add NEXT_PUBLIC_SUPABASE_URL');
console.log('# When prompted, enter: https://qwxydlvuioskvgxdkuvf.supabase.co');
console.log('# Select all environments (Production, Preview, Development)');
console.log('\nvercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('# When prompted, enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3eHlkbHZ1aW9za3ZneGRrdXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTM4OTQsImV4cCI6MjA2NDk2OTg5NH0.WhY9Lh7f-MtGcEs1k_o0y-yMUmGrRUnDHgBgFYUdB1c');
console.log('# Select all environments (Production, Preview, Development)');
console.log('\nvercel env add NEXT_PUBLIC_SITE_URL');
console.log('# When prompted, enter: https://pos-gadgettrack.vercel.app');
console.log('# Select all environments (Production, Preview, Development)');
console.log('\n# After adding all variables, run:');
console.log('vercel --prod');
console.log('------------------------------------');