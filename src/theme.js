import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1E4F8A", // Blau (Logo)
    },
    success: {
      main: "#6FB23F", // Grün (Logo)
    },
    background: {
      default: "#f4f6f8", // hellgrauer Seitenhintergrund
      paper: "#ffffff",   // Cards / Kalender
    },
    text: {
      primary: "#1f2937",   // sehr gut lesbar
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
})

export default theme
