
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ucmvhjawucyznchetekh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbXZoamF3dWN5em5jaGV0ZWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzkxNjAsImV4cCI6MjA1NzcxNTE2MH0.X5MgR734lS9Luu8fNMHvNfjYNqU9KBTDtta7QlW4cYI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'BladiTV',
      'x-application-version': '1.0.0'
    }
  }
});

export default supabase;
