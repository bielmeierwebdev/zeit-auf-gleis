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
      px={{ xs: 2, sm: 0 }} // ✅ mobile padding
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
          p: { xs: 3, sm: 5 }, // ✅ weniger Padding auf Mobile
          borderRadius: 3,
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Logo + Title */}
        <Box textAlign="center" mb={{ xs: 2, sm: 4 }}>
          <Box display="flex" justifyContent="center">
            <img
              src={logo}
              alt="ZeitAufGleis Logo"
              style={{
                height: 120,          // ✅ mobile
                maxHeight: 180,       // ✅ desktop bleibt groß
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </Box>

          <Typography variant="h5" fontWeight={600} mt={1}>
            Einloggen
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleLogin}>
          <TextField
            label="E-Mail-Adresse"
            type="email"
            fullWidth
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
            onChange={(e) => setPassword(e.target.value)}
            required
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
            sx={{ mt: 3, bgcolor: "#1E4F8A" }}
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
          mt={2}
        >
          Mit dem Einloggen stimmen Sie den Nutzungsbedingungen und der
          Datenschutzerklärung zu.
        </Typography>
      </Paper>
    </Box>
  );
}
