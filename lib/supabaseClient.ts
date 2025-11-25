import { createClient } from '@supabase/supabase-js';

// The base URL of your Supabase project.
const supabaseUrl = 'https://ovfhgfzdlwgjtzsfsgzf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZmhnZnpkbHdnanR6c2ZzZ3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Nzc4NTQsImV4cCI6MjA3NTI1Mzg1NH0.NWUYp9AkyzNiqC5oYUG59pOGzxJGvMbz8Bzu96e8qOI';

// Fix: Define and export DEMO_WRITE_TOKEN for anonymous chat messages.
export const DEMO_WRITE_TOKEN = 'INDOSTREET_DEMO_2024';

let supabase;

if (supabaseUrl && supabaseAnonKey) {
  try {
    // Explicitly set the schema to 'public' to prevent client-side schema cache issues.
    // This ensures the client is aware of all tables, even if they were added after
    // the initial connection.
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: 'public',
      },
    });
  } catch (error) {
    console.error("Supabase client failed to initialize despite presence of credentials:", error);
    supabase = null; // Ensure fallback is used
  }
}

if (!supabase) {
  if (!supabaseAnonKey) {
    console.warn(
      "Supabase anon key not found. The application will run in mock mode. Please ensure SUPABASE_ANON_KEY is configured."
    );
  }
  
  const dummySubscription = {
      unsubscribe: () => { /* no-op */ }
  };
  
  const dummyChannel = {
      on: () => dummyChannel,
      subscribe: () => dummySubscription
  };

  // Create a dummy client to prevent crashes. Data-fetching hooks will
  // fall back to mock data when operations on this client fail.
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    }),
    channel: () => dummyChannel,
    removeChannel: () => { /* no-op */ },
  } as any;
}

export { supabase };