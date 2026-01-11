import { Button, Stack } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

// db
import { getUser } from "../../db/getUser.js";
import { loadProfile } from "../../db/loadProfile";
import { updateProfile } from "../../db/updateProfile";
import { setNewPassword as  setNewPasswordDB } from "../../db/setNewPassword";

export function OpenSettingsModal({ settingsOpen, setSettingsOpen }) {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const [openPassword, setOpenPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!settingsOpen) return;

    async function load() {
      // Nutzer laden
      const user = await getUser();
      if (!user) return;
      setUser(user);

      // Profil laden
      const profile = await loadProfile(user.user.id);

      setFirstName(profile?.first_name || "");
      setLastName(profile?.last_name || "");
    }

    load();
  }, [settingsOpen]);

  async function handleSaveProfile() {
    if (!user) return;

    setLoading(true);

    // Profil updaten
    const error = await updateProfile(user.id, firstName, lastName);

    setLoading(false);

    if (error) {
      alert("Fehler beim Speichern" + error.message);
    } else {
      setSettingsOpen(false);
    }
  }

  async function handleChangePassword() {
    const error = await setNewPasswordDB(newPassword);

    if (error) {
      alert("Fehler beim Passwort ändern" + error.message);
    } else {
      setOpenPassword(false);
      setNewPassword("");
    }
  }

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
