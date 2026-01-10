import { supabase } from "../lib/supabase";

export async function logout(navigate) {
  await supabase.auth.signOut();
  navigate("/login");
}
