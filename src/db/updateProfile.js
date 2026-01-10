import { supabase } from "../lib/supabase";

export async function updateProfile(userId, firstName, lastName) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    first_name: firstName,
    last_name: lastName,
    //monthly_target_hours: soll,
  });
  return error;
}
