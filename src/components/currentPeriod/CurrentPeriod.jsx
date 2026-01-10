import { Box, Paper, Typography } from "@mui/material";

function CurrentPeriod({ monthStatusByWorker, hasMonthSheets, now }) {
  
    return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Aktueller Zeitraum
      </Typography>

      <Typography variant="h6" sx={{ mt: 0.5 }}>
        📅{" "}
        {now.toLocaleDateString("de-DE", {
          month: "long",
          year: "numeric",
        })}
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
            <Typography>{w.name}</Typography>
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
