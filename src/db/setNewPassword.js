import { supabase } from "../lib/supabase";

export async function setNewPassword(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return error;
}
