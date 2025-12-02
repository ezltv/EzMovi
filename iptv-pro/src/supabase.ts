import { createClient } from '@supabase/supabase-js'

// Tür kontrolünü (types) geçici olarak kaldırdık
// import { Database } from './types' 

const supabaseUrl = "https://zhmfglsqhjquqtdbeuvv.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobWZnbHNxaGpxdXF0ZGJldXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTgzNTksImV4cCI6MjA4MDIzNDM1OX0.It1Hj7ZMsERXAubF5oSnJkzD2zrzTVQVjXzQs7nOl8Y"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Key .env dosyasında bulunamadı!')
}

// <Database> kısmını sildik, artık düz bağlanacak
export const supabase = createClient(supabaseUrl, supabaseAnonKey)