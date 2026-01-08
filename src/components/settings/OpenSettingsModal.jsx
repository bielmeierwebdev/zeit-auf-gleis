import { Button, Stack } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; // Pfad ggf. anpassen

export function OpenSettingsModal({ settingsOpen, setSettingsOpen }) {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!settingsOpen) return;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;

      setUser(data.user);
      setFirstName(data.user.user_metadata?.first_name || "");
      setLastName(data.user.user_metadata?.last_name || "");
    };

    loadUser();
  }, [settingsOpen]);

  const handleSaveProfile = async () => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    setLoading(false);

    if (error) {
      alert("Fehler beim Speichern");
    } else {
      setSettingsOpen(false);
    }
  };

  const handleChangePassword = async () => {
    const newPassword = prompt("Neues Passwort eingeben");
    if (!newPassword) return;

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert("Passwort konnte nicht geändert werden");
    } else {
      alert("Passwort erfolgreich geändert");
    }
  };

  return (
    <Dialog
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Einstellungen</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} mt={1}>
          <TextField
            label="E-Mail"
            value={user?.email || ""}
            disabled
            fullWidth
          />

          <TextField
            label="Vorname"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Nachname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
          />

          <Button variant="outlined" onClick={handleChangePassword}>
            Passwort ändern
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setSettingsOpen(false)}>Abbrechen</Button>

        <Button
          variant="contained"
          onClick={handleSaveProfile}
          disabled={loading}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
