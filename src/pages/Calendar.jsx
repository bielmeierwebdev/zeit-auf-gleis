import CalendarGrid from "../components/calendar/CalendarGrid";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
} from "@mui/material";

export default function Calendar() {
  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            {/* KALENDER */}
            <CalendarGrid />

            {/* HEUTE STATUS */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                backgroundColor: "#ffffff",
                color: "black",
                width: "100%",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Heute
              </Typography>

              <Typography variant="body1">
                📅 <strong>08. Januar 2026</strong>
              </Typography>

              <Typography
                variant="body2"
                color="error.main"
                sx={{ mt: 1, mb: 3 }}
              >
                ❌ Für heute wurden noch keine Stunden erfasst.
              </Typography>

              <Button variant="contained" color="success" size="large">
                Stunden für heute erfassen
              </Button>
            </Paper>

            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                backgroundColor: "#ffffff",
                color: "black",
                width: "100%",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Januar 2026 – Überblick
              </Typography>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Erfasst
                  </Typography>
                  <Typography variant="h6">42,5 h</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Soll
                  </Typography>
                  <Typography variant="h6">160 h</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Offen
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    117,5 h
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" gutterBottom>
                Letzte Einträge
              </Typography>

              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>08.01.2026</TableCell>
                    <TableCell>6,5 h</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>07.01.2026</TableCell>
                    <TableCell>7 h</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} lg={6}></Grid>
      </Grid>
    </Box>
  );
}
