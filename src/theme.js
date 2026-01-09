import { createTheme } from "@mui/material/styles";
import { deDE } from "@mui/material/locale";

const theme = createTheme(
  {
    palette: {
      mode: "light",
      primary: {
        main: "#1E4F8A",
      },
      success: {
        main: "#6FB23F",
      },
      background: {
        default: "#f4f6f8",
        paper: "#ffffff",
      },
      text: {
        primary: "#1f2937",
        secondary: "#4b5563",
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
  deDE // 👈 DAS ist der entscheidende Teil
);

export default theme;
