import { useState, useEffect, useContext } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  useTheme,
} from "@mui/material";

// Components & Hooks
import TopBar from "../components/topbar/Topbar.jsx";

import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

import CalendarGrid from "../components/calendar/CalendarGrid";
import TimeSheetsPanel from "../components/timesheets/TimeSheetsPanel";
import TimeSheetModal from "../components/timesheets/TimeSheetModal";
import { OpenSettingsModal } from "../components/settings/OpenSettingsModal";
import { useMonthSheets } from "../hooks/useMonthSheets";
import { ColorModeContext } from "../ColorModeContext";
import { coWorkerData } from "../components/timesheets/coWorkerSelect";

import logo from "../assets/ZeitAufGleis-Logo.png";
import logoDark from "../assets/ZeitAufGleis-white-Logo.png";

export default function Overview() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();

  /* ===============================
     UI STATE
  =============================== */
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);

  /* ===============================
     TIMESHEET MODAL STATE
  =============================== */
  const [selectedDate, setSelectedDate] = useState(null);
  const [initialCoWorker, setInitialCoWorker] = useState(null);

  /* ===============================
     RELOAD
  =============================== */
  const [reloadKey, setReloadKey] = useState(0);
  const reloadAll = () => setReloadKey((k) => k + 1);

  /* ===============================
     DATA (HOOK)
  =============================== */
  /* ===============================
     DATA
  =============================== */
  const { monthSheets, loadMonthSheets } = useMonthSheets();

  /* ===============================
     AKTUELLER MONAT
  =============================== */
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthSheetsArray = Object.values(monthSheets).flat();

  const monthSheetsThisMonth = monthSheetsArray.filter((s) => {
    const d = new Date(s.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthStatusByWorker = coWorkerData.map((name) => ({
    name,
    hasSheet: monthSheetsThisMonth.some((s) => s.coworker_name === name),
  }));

  const hasMonthSheets = monthSheetsThisMonth.length > 0;

  /* ===============================
     DERIVED DATA
  =============================== */

  /* ===============================
     INITIAL LOAD / RELOAD
  =============================== */
  useEffect(() => {
    const d = new Date();
    loadMonthSheets(d.getFullYear(), d.getMonth());
  }, [reloadKey, loadMonthSheets]);

  /* ===============================
     ACTIONS
  =============================== */
  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const openForDate = (date, coworkerName = null) => {
    setSelectedDate(date);
    setInitialCoWorker(coworkerName);
    setTimeSheetOpen(true);
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      overflow={{ xs: "auto", md: "hidden" }}
    >
      {/* TOP BAR */}
      <TopBar
        colorMode={colorMode}
        setSettingsOpen={setSettingsOpen}
        logout={logout}
        theme={theme}
      />

      {/* MAIN */}
      <Box
        flex={1}
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap={4}
        p={{ xs: 2, md: 3 }}
        overflow={{ xs: "visible", md: "hidden" }}
      >
        {/* LEFT */}
        <Box
          width={{ xs: "100%", md: 420 }}
          minWidth={{ md: 420 }}
          display="flex"
          flexDirection="column"
          gap={4}
          overflow="auto"
        >
          <CalendarGrid
            onSelectDate={(d) => openForDate(d)}
            timesheetsByDate={monthSheets}
            onMonthChange={loadMonthSheets}
          />

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
        </Box>

        {/* RIGHT */}
        <Box flex={1} minWidth={0} overflow="hidden">
          <TimeSheetsPanel
            openForDate={openForDate}
            reloadKey={reloadKey}
            onReload={reloadAll}
          />
        </Box>
      </Box>

      {/* MODALS */}
      <OpenSettingsModal
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
      />

      <TimeSheetModal
        open={timeSheetOpen}
        onClose={() => {
          setTimeSheetOpen(false);
          setInitialCoWorker(null);
        }}
        date={selectedDate}
        initialCoWorker={initialCoWorker}
        onSaved={reloadAll}
      />
    </Box>
  );
}
