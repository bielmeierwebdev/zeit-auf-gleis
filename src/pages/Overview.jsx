import TimeSheetsPanel from "../components/timesheets/TimeSheetsPanel";
import CalendarGrid from "../components/calendar/CalendarGrid";
import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { OpenSettingsModal } from "../components/settings/OpenSettingsModal";
import logo from "../assets/ZeitAufGleis-Logo.png";
import TimeSheetModal from "../components/timesheets/TimeSheetModal";

export default function Overview() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const openForDate = (date) => {
    setSelectedDate(date);
    setTimeSheetOpen(true);
  };

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      {/* TOP BAR */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        py={1.5}
        borderBottom="1px solid #e5e7eb"
      >
        {/* LEFT: LOGO */}
        <Box display="flex" alignItems="center">
          <img
            src={logo}
            alt="ZeitAufGleis"
            style={{
              height: 40,
              objectFit: "contain",
              margin: -20,
            }}
          />
        </Box>

        {/* RIGHT: ACTIONS */}
        <Box display="flex" alignItems="center">
          <Button
            variant="text"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
          >
            Einstellungen
          </Button>

          <Button
            variant="text"
            size="small"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        flex={1}
        display="flex"
        gap={4}
        p={3}
        boxSizing="border-box"
        overflow="hidden"
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
          {/* Überblick */}
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

          <CalendarGrid onSelectDate={openForDate} />

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
              onClick={() => openForDate(new Date())}
            >
              Stunden für heute erfassen
            </Button>
          </Paper>
        </Box>

        {/* RIGHT COLUMN */}
        <Box flex={1} minWidth={0} overflow="hidden">
          <TimeSheetsPanel />
        </Box>
      </Box>

      {/* SETTINGS MODAL – kommt als Nächstes */}
      <OpenSettingsModal
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
      />

      <TimeSheetModal
        open={timeSheetOpen}
        onClose={() => setTimeSheetOpen(false)}
        date={selectedDate}
      />
    </Box>
  );
}
