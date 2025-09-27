import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fpzwgcwcfgcvwxkyaqbe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwendnY3djZmdjdnd4a3lhcWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzY2MzksImV4cCI6MjA3NDU1MjYzOX0.iN4z_uz9UlkDv4K3qZh08hPgaONECWYeKIwGB7OxkR8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
