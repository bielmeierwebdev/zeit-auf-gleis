import { createTheme } from "@mui/material/styles";
import { deDE } from "@mui/material/locale";

export const getTheme = (mode = "light") =>
  createTheme(
    {
      palette: {
        mode,

        primary: {
          main: "#1E4F8A",
        },
        success: {
          main: "#6FB23F",
        },

        background:
          mode === "light"
            ? {
                default: "#f4f6f8",
                paper: "#ffffff",
              }
            : {
                default: "#020617",
                paper: "#020617",
              },

        text:
          mode === "light"
            ? {
                primary: "#1f2937",
                secondary: "#4b5563",
              }
            : {
                primary: "#e5e7eb",
                secondary: "#9ca3af",
              },
      },

      typography: {
        fontFamily: "Inter, system-ui, sans-serif",
        button: {
          textTransform: "none",
          fontWeight: 600,
        },
      },

      shape: {
        borderRadius: 12,
      },

      components: {
        MuiTablePagination: {
          defaultProps: {
            labelDisplayedRows: ({ from, to, count }) =>
              `${from}–${to} von ${count !== -1 ? count : `mehr als ${to}`}`,
            labelRowsPerPage: "Zeilen pro Seite:",
          },
        },
      },
    },
    deDE
  );
