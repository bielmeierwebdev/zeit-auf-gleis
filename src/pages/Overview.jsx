import { useState, useEffect, useContext } from "react";
import { Box, useTheme } from "@mui/material";
import * as overviewStyles from "../Styles/overviewStyles.js";

// Components & Hooks
import TopBar from "../components/topbar/Topbar.jsx";
import CurrentPeriod from "../components/currentPeriod/CurrentPeriod.jsx";
import CalendarGrid from "../components/calendar/CalendarGrid";
import TimeSheetsPanel from "../components/timesheets/TimeSheetsPanel";
import TimeSheetModal from "../components/timesheets/TimeSheetModal";

//import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

import { OpenSettingsModal } from "../components/settings/OpenSettingsModal";
import { useMonthSheets } from "../hooks/useMonthSheets";
import { ColorModeContext } from "../ColorModeContext";
import { coWorkerData } from "../components/timesheets/coWorkerSelect";

// db
import { logout } from "../db/logout";

export default function Overview() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [initialCoWorker, setInitialCoWorker] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reloadAll = () => setReloadKey((k) => k + 1);
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
     INITIAL LOAD / RELOAD
  =============================== */
  useEffect(() => {
    const d = new Date();
    loadMonthSheets(d.getFullYear(), d.getMonth());
  }, [reloadKey, loadMonthSheets]);

  function openForDate(date, coworkerName = null) {
    setSelectedDate(date);
    setInitialCoWorker(coworkerName);
    setTimeSheetOpen(true);
  }

  return (
    <Box sx={overviewStyles.box}>
      {/* TOP BAR */}
      <TopBar
        colorMode={colorMode}
        setSettingsOpen={setSettingsOpen}
        logout={() => logout(navigate)}
        theme={theme}
      />

      {/* MAIN */}
      <Box sx={overviewStyles.mainBox}>
        {/* LEFT */}
        <Box sx={overviewStyles.leftPanel}>
          <CalendarGrid
            onSelectDate={(d) => openForDate(d)}
            timesheetsByDate={monthSheets}
            onMonthChange={loadMonthSheets}
            today={now}
          />
          <CurrentPeriod
            monthStatusByWorker={monthStatusByWorker}
            hasMonthSheets={hasMonthSheets}
            now={now}
          />
        </Box>

        {/* RIGHT */}
        <Box sx={overviewStyles.rightPanel}>
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
