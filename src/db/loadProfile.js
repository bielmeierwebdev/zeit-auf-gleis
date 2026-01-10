import { supabase } from "../lib/supabase";

export async function loadProfile(userId) {
    const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, monthly_target_hours")
            .eq("id", userId)
            .single();
            
    return profile;
}