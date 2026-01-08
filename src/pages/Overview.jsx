import TimeSheetsPanel from "../components/timesheets/TimeSheetsPanel"
import CalendarGrid from "../components/calendar/CalendarGrid"
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
} from "@mui/material"

export default function Overview() {
  return (
    <Box
      height="100vh"
      display="flex"
      gap={4}
      p={3}
      boxSizing="border-box"
    >
      {/* LEFT COLUMN */}
      <Box
        width={420}
        minWidth={420}
        display="flex"
        flexDirection="column"
        gap={4}
        overflow="auto"
      >
        {/* MONATSÜBERBLICK */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Januar 2026 – Überblick
          </Typography>

          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Erfasst
              </Typography>
              <Typography variant="h6">42,5 h</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Soll
              </Typography>
              <Typography variant="h6">160 h</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Offen
              </Typography>
              <Typography variant="h6" color="warning.main">
                117,5 h
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* KALENDER */}
        <CalendarGrid />

        {/* HEUTE */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Heute
          </Typography>

          <Typography variant="h6" sx={{ mt: 0.5 }}>
            📅 08. Januar 2026
          </Typography>

          <Typography variant="body2" color="error.main" sx={{ mt: 1.5 }}>
            Für heute wurden noch keine Stunden erfasst.
          </Typography>

          <Button
            variant="contained"
            color="success"
            size="large"
            sx={{ mt: 3 }}
            fullWidth
          >
            Stunden für heute erfassen
          </Button>
        </Paper>
      </Box>

      {/* RIGHT COLUMN */}
      <Box
        flex={1}
        minWidth={0}
        overflow="hidden"
      >
        <TimeSheetsPanel />
      </Box>
    </Box>
  )
}
