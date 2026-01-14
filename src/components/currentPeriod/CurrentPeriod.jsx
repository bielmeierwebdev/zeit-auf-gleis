import { Box, Paper, Typography } from "@mui/material";
import { MONTHS } from "../calendar/monthList";
import { coworkerColors } from "../calendar/coWorkerColors";

function CurrentPeriod({ monthStatusByWorker, hasMonthSheets, month, year }) {
  return (
    <Paper sx={{ p: 3 }}>
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

      {console.log(coworkerColors)}

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
    </Paper>
  );
}

export default CurrentPeriod;
