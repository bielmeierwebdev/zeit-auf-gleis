import { Outlet, Link, useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Stack,
  Divider,
} from "@mui/material"
import logo from "../../assets/ZeitAufGleis-white-Logo.png"
import { supabase } from "../../lib/supabase"

export default function AppShell() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <Box display="flex" height="100vh" bgcolor="#f4f6f8">

      {/* SIDEBAR */}
      <Box
        width={280}
        display="flex"
        flexDirection="column"
        bgcolor="#1e293b"
        color="white"
        px={2}
      >
        {/* LOGO BOX */}
        <Box
          height={140}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
            <img
              src={logo}
              alt="ZeitAufGleis"
              style={{
                height: 140,
                objectFit: "contain",
                margin: -15
              }}
            />
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", mb: 2 }} />

        {/* NAVIGATION (CENTERED) */}
        <Stack
          flex={1}
          justifyContent="center"
          alignItems="center"
          spacing={3}
        >
          <Button
            component={Link}
            to="/"
            sx={navButtonStyle}
          >
            Kalender
          </Button>

          <Button
            component={Link}
            to="/overview"
            sx={navButtonStyle}
          >
            Übersicht
          </Button>

          <Button
            component={Link}
            to="/settings"
            sx={navButtonStyle}
          >
            Einstellungen
          </Button>
        </Stack>

        {/* LOGOUT */}
        <Box
          height={100}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Button
            variant="outlined"
            color="error"
            size="large"
            onClick={handleLogout}
            sx={{
              textTransform: "none",
              borderWidth: 2,
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* CONTENT */}
      <Box
        flex={1}
        p={3}
        overflow="auto"
        bgcolor="#f4f6f8"
      >
        <Outlet />
      </Box>
    </Box>
  )
}

const navButtonStyle = {
  color: "white",
  fontSize: 18,
  textTransform: "none",
  px: 4,
  py: 1.5,
  borderRadius: 2,
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
}
