import { useState, useEffect } from "react";
import { Box, IconButton, Typography, Paper, Button } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { coworkerColors } from "./coWorkerColors";

// helpers
import { MONTHS } from "./monthList";
import { getISOWeek } from "./getISOWeek";

// styles
import * as calendarStyles from "../../Styles/calendarStyles.js";

export default function CalendarGrid({
  onSelectDate,
  timesheetsByDate = {},
  onMonthChange,
  today,
}) {
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // Kalendermonat Infos
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = (firstDay.getDay() + 6) % 7;

  const totalCells = startDay + daysInMonth;
  const weeks = Math.ceil(totalCells / 7);

  // Monat ändern Effekt
  useEffect(() => {
    onMonthChange?.(year, month);
  }, [year, month]);

  // Monat wechseln
  function goPrevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <Paper sx={{ p: 3, width: "100%" }}>
      {/* HEADER */}
      <Box sx={calendarStyles.box}>
        <IconButton onClick={goPrevMonth}>
          <ChevronLeftIcon />
        </IconButton>

        <Typography variant="h6" fontWeight={600}>
          {MONTHS[month]} {year}
        </Typography>

        <IconButton onClick={goNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* WOCHENTAGE */}
      <Box sx={calendarStyles.weekDaysBox}>
        <Typography variant="caption" align="center">
          KW
        </Typography>

        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
          <Typography key={d} align="center" fontWeight={500}>
            {d}
          </Typography>
        ))}
      </Box>

      {/* WOCHEN */}
      {Array.from({ length: weeks }).map((_, weekIndex) => {
        const firstDayOfWeek = new Date(
          year,
          month,
          weekIndex * 7 - startDay + 1
        );
        const kw = getISOWeek(firstDayOfWeek);

        return (
          <Box key={weekIndex} sx={calendarStyles.calendarGridBox}>
            <Typography
              align="center"
              color="text.secondary"
              sx={{ lineHeight: "36px" }}
            >
              {kw}
            </Typography>

            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const dayNumber = weekIndex * 7 + dayIndex - startDay + 1;

              if (dayNumber < 1 || dayNumber > daysInMonth) {
                return <Box key={dayIndex} />;
              }

              const dateObj = new Date(year, month, dayNumber);
              const dateKey = dateObj.toLocaleDateString("sv-SE");

              const sheetsForDay = timesheetsByDate[dateKey] || [];

              const coworkersForDay = [
                ...new Set(sheetsForDay.map((s) => s.coworker_name)),
              ].filter(Boolean);

              return (
                <Button color="inherit" sx={calendarStyles.day}>
                  <Box
                    sx={calendarStyles.dayBox}
                    onClick={() => onSelectDate(dateObj)}
                  >
                    <Typography fontSize={14} fontWeight={600}>
                      {dayNumber}
                    </Typography>

                    {coworkersForDay.length > 0 && (
                      <Box sx={calendarStyles.coworkersBox}>
                        {coworkersForDay.map((name) => (
                          <Box
                            key={name}
                            sx={{
                              ...calendarStyles.coworkersDot,
                              backgroundColor: coworkerColors[name],
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Button>
              );
            })}
          </Box>
        );
      })}
    </Paper>
  );
}
