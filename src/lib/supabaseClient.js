import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lzmvzdzbjzfnzjzahqqq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bXZ6ZHpianpmbnpqemFocXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTEwMzQsImV4cCI6MjA2OTUyNzAzNH0.rXWtEtC1rdMQVouG--7ytosHSdK252boP3NCwCzWXVI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
