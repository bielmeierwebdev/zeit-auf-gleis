import { Box, Divider, Paper, Typography } from "@mui/material";
import { MONTHS } from "../calendar/monthList";
import { coworkerColors } from "../calendar/coWorkerColors";
import { supabase } from "../../lib/supabase";
import React from "react";
import { getUser } from "../../db/getUser";

function CurrentPeriod({
  reloadKey,
  monthStatusByWorker,
  hasMonthSheets,
  month,
  year
}) {
  const [lastTimesheet, setLastTimesheet] = React.useState([]);
  const [lastStundenblatt, setLastStundenblatt] = React.useState([]);

  async function getLastTimeSheet() {
    const user = await getUser();
    if (!user) return;

    const { data: lastTimesheet } = await supabase
      .from("timesheets")
      .select("id, date, coworker_name, total_hours, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setLastTimesheet(lastTimesheet);
  }

  async function getLastStundenblatt() {
    const { data: lastSheet, error: sbError } = await supabase
      .from("stundenblaetter")
      .select("id, from_date, coworker_name, total_hours, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sbError) console.error(sbError);

    setLastStundenblatt(lastSheet);
  }

  React.useEffect(() => {
    getLastTimeSheet();
    getLastStundenblatt();
  }, [reloadKey]);

  return (
    <Paper sx={{ p: 3, flex: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Aktueller Zeitraum
      </Typography>

      <Typography variant="h6" sx={{ mt: 0.5 }}>
        📅 {MONTHS[month]} {year}
      </Typography>

      <Typography
        sx={{ mt: 1 }}
        color={hasMonthSheets ? "success.main" : "warning.main"}
      >
        {hasMonthSheets
          ? "Es wurden bereits Stunden erfasst."
          : "Für diesen Monat fehlen noch Einträge."}
      </Typography>

      <Box mt={2} display="flex" flexDirection="column" gap={0.5}>
        {monthStatusByWorker.map((w) => (
          <Box key={w.name} display="flex" justifyContent="space-between">
            {/* Name + Dot */}
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: coworkerColors[w.name],
                }}
              />
              <Typography>{w.name}</Typography>
            </Box>

            {/* Status */}
            <Typography
              color={w.hasSheet ? "success.main" : "error.main"}
              fontWeight={500}
            >
              {w.hasSheet ? "✓ erfasst" : "✗ fehlt"}
            </Typography>
          </Box>
        ))}
      </Box>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Box mt={1}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Letzte Aktivität
        </Typography>

        {/* Stundenzettel */}
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Typography fontSize={16}>🕒</Typography>
          <Typography fontSize={16} fontWeight={500}>
            Stundenzettel
          </Typography>
          {lastTimesheet ? (
            <Typography fontSize={16} color="text.secondary">
              {`${new Date(lastTimesheet.date).toLocaleDateString("de-DE")} · ${
                lastTimesheet.coworker_name
              }`}
            </Typography>
          ) : (
            <Typography fontSize={16} color="text.secondary">
              Noch nicht erstellt
            </Typography>
          )}
        </Box>

        {/* Stundenblatt */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography fontSize={16}>🕒</Typography>
          <Typography fontSize={16} fontWeight={500}>
            Stundenblatt
          </Typography>
          {lastStundenblatt ? (
            <Typography fontSize={16} color="text.secondary">
              {`${new Date(lastStundenblatt.from_date).toLocaleDateString(
                "de-DE",
                {
                  month: "long",
                  year: "numeric",
                }
              )} · ${lastStundenblatt.coworker_name}`}
            </Typography>
          ) : (
            <Typography fontSize={16} color="text.secondary">
              Noch nicht erstellt
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default CurrentPeriod;
