import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    if (error) throw error;
    console.log('Supabase connection successful:', data);
  } catch (err) {
    console.error('Supabase test failed:', err);
  }
}

testConnection();