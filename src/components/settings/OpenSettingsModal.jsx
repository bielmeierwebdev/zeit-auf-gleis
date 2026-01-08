import { Button, Stack } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export function OpenSettingsModal({ settingsOpen, setSettingsOpen }) {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const [openPassword, setOpenPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!settingsOpen) return;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      setFirstName(profile?.first_name || "");
      setLastName(profile?.last_name || "");
    };

    load();
  }, [settingsOpen]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
      });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Fehler beim Speichern");
    } else {
      setSettingsOpen(false);
    }
  };

  const handleChangePassword = async () => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error(error);
      alert("Fehler beim Passwort ändern");
    } else {
      setOpenPassword(false);
      setNewPassword("");
    }
  };

  return (
    <>
      {/* PROFIL */}
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

            <Button variant="outlined" onClick={() => setOpenPassword(true)}>
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

      {/* PASSWORT */}
      <Dialog
        open={openPassword}
        onClose={() => setOpenPassword(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Passwort ändern</DialogTitle>

        <DialogContent dividers>
          <TextField
            label="Neues Passwort"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenPassword(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleChangePassword}>
            Ändern
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
