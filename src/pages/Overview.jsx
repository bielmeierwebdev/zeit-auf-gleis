import { useState, useEffect } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

import CalendarGrid from "../components/calendar/CalendarGrid";
import TimeSheetsPanel from "../components/timesheets/TimeSheetsPanel";
import TimeSheetModal from "../components/timesheets/TimeSheetModal";
import { OpenSettingsModal } from "../components/settings/OpenSettingsModal";

import logo from "../assets/ZeitAufGleis-Logo.png";

export default function Overview() {
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
     DATA STATE
  =============================== */
  const [monthSheets, setMonthSheets] = useState({});
  const [monthlyTarget, setMonthlyTarget] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  /* ===============================
     HELPERS
  =============================== */
  const reloadAll = () => setReloadKey((k) => k + 1);

  const today = new Date();
  const todayKey = today.toLocaleDateString("sv-SE");

  const todaySheets = monthSheets[todayKey] ?? [];
  const todayTotal = todaySheets.reduce(
    (sum, ts) => sum + (ts.total_hours || 0),
    0
  );

  const totalMonthHours = Object.values(monthSheets).reduce(
    (sum, daySheets) =>
      sum + daySheets.reduce((s, ts) => s + (ts.total_hours || 0), 0),
    0
  );

  /* ===============================
     LOAD MONTH DATA
  =============================== */
  const loadMonthSheets = async (year, month) => {
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
  };

  /* ===============================
     INITIAL LOAD + RELOAD
  =============================== */
  useEffect(() => {
    const d = new Date();
    loadMonthSheets(d.getFullYear(), d.getMonth());
  }, [reloadKey]);

  /* ===============================
     NAV / AUTH
  =============================== */
  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  /* ===============================
     OPEN TIMESHEET (ZENTRAL!)
  =============================== */
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
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={{ xs: 2, md: 3 }}
        py={1.5}
        borderBottom="1px solid #e5e7eb"
      >
        <Box display="flex" alignItems="center">
          <img src={logo} alt="ZeitAufGleis" style={{ height: 40 }} />
        </Box>

        <Box display="flex" gap={1}>
          <Button
            variant="text"
            size="small"
            onClick={() => setSettingsOpen(true)}
            startIcon={<SettingsIcon />}
          >
            <Box sx={{ display: { xs: "none", md: "inline" } }}>
              Einstellungen
            </Box>
          </Button>

          <Button
            variant="text"
            size="small"
            color="error"
            onClick={logout}
            startIcon={<LogoutIcon />}
          >
            <Box sx={{ display: { xs: "none", md: "inline" } }}>Logout</Box>
          </Button>
        </Box>
      </Box>

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
              Heute
            </Typography>

            <Typography variant="h6" sx={{ mt: 0.5 }}>
              📅 {today.toLocaleDateString("de-DE")}
            </Typography>

            {todaySheets.length > 0 ? (
              <Typography color="success.main">
                Heute erfasst: {todayTotal.toFixed(2)} h
              </Typography>
            ) : (
              <Typography color="error.main">
                Für heute wurden noch keine Stunden erfasst.
              </Typography>
            )}

            <Button
              variant="contained"
              color="success"
              sx={{ mt: 3 }}
              fullWidth
              onClick={() => openForDate(new Date())}
            >
              Stunden für heute erfassen
            </Button>
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
