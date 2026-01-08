import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase ENV Variablen fehlen. Prüfe VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY."
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
