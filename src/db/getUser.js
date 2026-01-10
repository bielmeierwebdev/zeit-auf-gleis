import { supabase } from "../lib/supabase";

export function getUser() {
  const user = supabase.auth.user();

  return user;
}
