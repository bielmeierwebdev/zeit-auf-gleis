import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useMonthSheets() {
  const [monthSheets, setMonthSheets] = useState({});
  const [monthlyTarget, setMonthlyTarget] = useState(0);

  const loadMonthSheets = useCallback(async (year, month) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("monthly_target_hours")
      .eq("id", user.id)
      .single();

    setMonthlyTarget(Number(profile?.monthly_target_hours || 0));

    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("timesheets")
      .select("id, date, total_hours, coworker_name")
      .eq("user_id", user.id)
      .gte("date", from)
      .lte("date", to);

    if (error) {
      console.error(error);
      return;
    }

    const map = {};
    (data || []).forEach((ts) => {
      if (!map[ts.date]) map[ts.date] = [];
      map[ts.date].push(ts);
    });

    setMonthSheets(map);
  }, []);

  return {
    monthSheets,
    monthlyTarget,
    loadMonthSheets,
  };
}
