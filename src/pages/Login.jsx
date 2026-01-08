import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import background from "../assets/background-picture.png";
import logo from "../assets/ZeitAufGleis-Logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate("/");
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      />

      {/* Login Card */}
      <Paper
        elevation={12}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          p: 5,
          borderRadius: 3,
          backgroundColor: "rgba(255,255,255,0.92)", // 👈 KEY
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Logo + Title */}
        <Box textAlign="center" mb={4}>
          <Box display="flex" justifyContent="center">
            <img
              src={logo}
              alt="ZeitAufGleis Logo"
              style={{
                height: 180,
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </Box>

          <Typography variant="h5" fontWeight={600}>
            Einloggen
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleLogin}>
          <TextField
            label="E-Mail-Adresse"
            type="email"
            fullWidth
            InputLabelProps={{
              sx: {
                color: "#374151", // dunkelgrau
                fontWeight: 500,
              },
            }}
            InputProps={{
              sx: {
                backgroundColor: "#ffffff",
                borderRadius: 2,
              },
            }}
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Passwort"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            InputLabelProps={{
              sx: {
                color: "#374151", // dunkelgrau
                fontWeight: 500,
              },
            }}
            InputProps={{
              sx: {
                backgroundColor: "#ffffff",
                borderRadius: 2,
              },
            }}
            onChange={(e) => setPassword(e.target.value)}
            required
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin(e);
              }
            }}
          />

          {error && (
            <Typography color="error" variant="body2" align="center" mt={2}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 4, bgcolor: "#1E4F8A" }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Einloggen"}
          </Button>
        </Box>

        {/* Footer */}
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
          mt={3}
        >
          Mit dem Einloggen stimmen Sie den Nutzungsbedingungen und der
          Datenschutzerklärung zu.
        </Typography>
      </Paper>
    </Box>
  );
}
