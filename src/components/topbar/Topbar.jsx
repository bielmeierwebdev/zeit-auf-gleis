import React from "react";
import { Box, Button, IconButton } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../../assets/ZeitAufGleis-Logo.png";
import logoDark from "../../assets/ZeitAufGleis-white-Logo.png";
import * as boxStyles from "../../Styles/topbarStyles.js";

function Topbar({ colorMode, setSettingsOpen, logout, theme }) {
  return (
    <Box sx={boxStyles.box}>
      <Box display="flex" alignItems="center">
        <img
          src={theme.palette.mode === "dark" ? logoDark : logo}
          alt="ZeitAufGleis"
          style={{ height: 40 }}
        />
      </Box>

      <Box display="flex" gap={1}>
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

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
  );
}

export default Topbar;
