import { supabase } from "../lib/supabase";

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();

  console.log(data);

  if (error) {
    console.error(error);
    return null;
  }

  return data.user;
}
