import TimeSheetsPanel from "../components/timesheets/TimeSheetsPanel";
import CalendarGrid from "../components/calendar/CalendarGrid";
import { Box, Paper, Typography, Button } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { OpenSettingsModal } from "../components/settings/OpenSettingsModal";
import logo from "../assets/ZeitAufGleis-Logo.png";
import TimeSheetModal from "../components/timesheets/TimeSheetModal";

export default function Overview() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthSheets, setMonthSheets] = useState({});
  const [reloadKey, setReloadKey] = useState(0);
  const [monthlyTarget, setMonthlyTarget] = useState(0);

  const reloadAll = () => {
    setReloadKey((k) => k + 1);
  };

  const today = new Date();
  const todayKey = today.toLocaleDateString("sv-SE");

  // Monats-Summe berechnen
  const totalMonthHours = Object.values(monthSheets).reduce(
    (sum, ts) => sum + (ts.total_hours || 0),
    0
  );

  // Soll (später aus DB)
  //const monthlyTarget = 160;

  // Heute
  const todaySheet = monthSheets[todayKey] ?? null;

  const loadMonthSheets = async (year, month) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("monthly_target_hours")
      .eq("id", user.id)
      .single();

    console.log(profile);

    if (!profileError) {
      setMonthlyTarget(Number(profile.monthly_target_hours || 0));
    }

    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("timesheets")
      .select("id, date, total_hours")
      .eq("user_id", user.id)
      .gte("date", from)
      .lte("date", to);

    if (error) {
      console.error(error);
      return;
    }

    console.log(data);

    const map = {};
    data.forEach((ts) => {
      map[ts.date] = ts;
    });

    setMonthSheets(map);
  };

  // ✅ EINMAL beim Laden der Seite
  useEffect(() => {
    async function fetchLoadMonth() {
      const today = new Date();
      await loadMonthSheets(today.getFullYear(), today.getMonth());
    }
    fetchLoadMonth();
  }, [reloadKey]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const openForDate = (date) => {
    setSelectedDate(date);
    setTimeSheetOpen(true);
  };

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
        {/* LOGO */}
        <Box display="flex" alignItems="center">
          <img
            src={logo}
            alt="ZeitAufGleis"
            style={{ height: 40, objectFit: "contain" }}
          />
        </Box>

        {/* ACTIONS */}
        <Box display="flex" alignItems="center" gap={1}>
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

      {/* MAIN CONTENT */}
      <Box
        flex={1}
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap={4}
        p={{ xs: 2, md: 3 }}
        boxSizing="border-box"
        overflow={{ xs: "visible", md: "hidden" }}
      >
        {/* LEFT COLUMN */}
        <Box
          width={{ xs: "100%", md: 420 }}
          minWidth={{ md: 420 }}
          display="flex"
          flexDirection="column"
          gap={4}
          overflow="auto"
        >
          {/**  <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Januar 2026 – Überblick
            </Typography>

            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Erfasst
                </Typography>
                <Typography variant="h6">
                  {totalMonthHours.toFixed(2)} h
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Soll
                </Typography>
                <Typography variant="h6">{monthlyTarget} h</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Offen
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {(monthlyTarget - totalMonthHours).toFixed(2)} h
                </Typography>
              </Box>
            </Box>
          </Paper>*/}

          <CalendarGrid
            onSelectDate={openForDate}
            timesheetsByDate={monthSheets}
          />

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Heute
            </Typography>

            <Typography variant="h6" sx={{ mt: 0.5 }}>
              📅 {today.toLocaleDateString("de-DE")}
            </Typography>

            {todaySheet ? (
              <Typography variant="body2" color="success.main" sx={{ mt: 1.5 }}>
                Heute erfasst: {todaySheet.total_hours.toFixed(2)} h
              </Typography>
            ) : (
              <Typography variant="body2" color="error.main" sx={{ mt: 1.5 }}>
                Für heute wurden noch keine Stunden erfasst.
              </Typography>
            )}

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
        <Box flex={1} minWidth={0} overflow="hidden" mt={{ xs: 4, md: 0 }}>
          <TimeSheetsPanel openForDate={openForDate} reloadKey={reloadKey} />
        </Box>
      </Box>

      <OpenSettingsModal
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
      />

      <TimeSheetModal
        open={timeSheetOpen}
        onClose={() => setTimeSheetOpen(false)}
        date={selectedDate}
        reloadKey={reloadKey}
      />
    </Box>
  );
}
