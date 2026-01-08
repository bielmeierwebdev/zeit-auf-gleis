import { useState } from "react";
import { Box, IconButton, Typography, Paper, Button } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function getISOWeek(date) {
  const temp = new Date(date);
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(((temp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
}

export default function CalendarGrid({ onSelectDate }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = (firstDay.getDay() + 6) % 7;

  const totalCells = startDay + daysInMonth;
  const weeks = Math.ceil(totalCells / 7);

  return (
    <Paper sx={{ p: 3, width: "100%" }}>
      {/* HEADER */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <IconButton
          onClick={() =>
            month === 0
              ? (setMonth(11), setYear((y) => y - 1))
              : setMonth((m) => m - 1)
          }
        >
          <ChevronLeftIcon />
        </IconButton>

        <Typography variant="h6" fontWeight={600}>
          {MONTHS[month]} {year}
        </Typography>

        <IconButton
          onClick={() =>
            month === 11
              ? (setMonth(0), setYear((y) => y + 1))
              : setMonth((m) => m + 1)
          }
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* WOCHENTAGE */}
      <Box
        display="grid"
        gridTemplateColumns="48px repeat(7, minmax(0, 1fr))"
        gap={1}
        mb={1}
      >
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
          <Box
            key={weekIndex}
            display="grid"
            gridTemplateColumns="48px repeat(7, minmax(0, 1fr))"
            gap={1}
            mb={1}
          >
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

              return (
                <Button
                  key={dayIndex}
                  variant="outlined"
                  sx={{
                    aspectRatio: "1 / 1",
                    width: "100%",
                    minWidth: 0,
                    borderRadius: 3,
                    fontSize: 14,
                    fontWeight: 500,
                    borderColor: "#e5e7eb",
                    backgroundColor: "#f9fafb",
                    "&:hover": {
                      backgroundColor: "#e0f2fe",
                      borderColor: "#90caf9",
                    },
                  }}
                  onClick={() => onSelectDate(new Date(year, month, dayNumber))}
                >
                  {dayNumber}
                </Button>
              );
            })}
          </Box>
        );
      })}
    </Paper>
  );
}
