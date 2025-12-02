import { createClient } from '@supabase/supabase-js'

// Tür kontrolünü (types) geçici olarak kaldırdık
// import { Database } from './types' 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Key .env dosyasında bulunamadı!')
}

// <Database> kısmını sildik, artık düz bağlanacak
export const supabase = createClient(supabaseUrl, supabaseAnonKey)