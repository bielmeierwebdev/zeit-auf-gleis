import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  IconButton,
  MenuItem,
  Divider,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { generateTimeSheetPdf } from "../../utils/generateTimeSheetPdf";
import { coWorkerData } from "./coWorkerSelect";

// 🔢 Stundenberechnung
function calcHours(start, end, pauseMinutes = 0) {
  if (!start || !end) return 0;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const minutes = endMinutes - startMinutes - Number(pauseMinutes || 0);
  return Math.max(minutes / 60, 0);
}

export default function TimeSheetModal({
  open,
  onClose,
  date,
  onSaved,
  initialCoWorker,
}) {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(true);
  const [entries, setEntries] = useState([]);
 const [activeCoWorker, setActiveCoWorker] = useState(null);

  const [openTimeSheet, setOpenTimeSheet] = useState(false);

 useEffect(() => {
  if (!open) return;

  if (initialCoWorker) {
    setActiveCoWorker(initialCoWorker);
    setOpenTimeSheet(true); // direkt ins Stundenzettel-Modal
  } else {
    setActiveCoWorker(null); // Kalender-Fall
    setOpenTimeSheet(false);
  }
}, [initialCoWorker, open]);


  useEffect(() => {
    if (!openTimeSheet || !date) return;

    const load = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const dateString = date.toLocaleDateString("sv-SE");

      console.log(activeCoWorker);

      const { data: timesheet } = await supabase
        .from("timesheets")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", dateString)
        .eq("coworker_name", activeCoWorker)
        .maybeSingle();


      if (!timesheet) {
        // 🆕 neuer Stundenzettel
        setEntries([
          {
            id: crypto.randomUUID(),
            activity: "",
            service: "",
            number: "",
            name: "",
            location: "Zwiesel",
            startTime: "",
            endTime: "",
            breakMinutes: 0,
          },
        ]);
        setEditMode(true);
        setLoading(false);
        return;
      }

      // 📄 vorhandener Stundenzettel → read-only
      const { data: entriesData } = await supabase
        .from("timesheet_entries")
        .select(
          `
        id,
        activity,
        service,
        number,
        name,
        location,
        start_time,
        end_time,
        break_minutes
      `
        )
        .eq("timesheet_id", timesheet.id)
        .order("start_time");

      setEntries(
        entriesData.map((e) => ({
          id: e.id,
          activity: e.activity,
          service: e.service,
          number: e.number,
          name: e.name,
          location: e.location || "Zwiesel",
          startTime: e.start_time,
          endTime: e.end_time,
          breakMinutes: e.break_minutes,
        }))
      );

      setEditMode(false); // 🔒 schreibgeschützt
      setLoading(false);
    };

    load();
  }, [openTimeSheet, date, activeCoWorker]);

  /*
  useEffect(() => {
    if (!open || !date) return;

    setLoading(true);

    setEntries([
      {
        id: crypto.randomUUID(),
        activity: "",
        service: "",
        number: "",
        name: "",
        location: "Zwiesel",
        startTime: "",
        endTime: "",
        breakMinutes: 0,
      },
    ]);

    setEditMode(true);
    setLoading(false);
  }, [open, date, activeCoWorker]);*/

  if (!date) return null;

  const totalHours = entries.reduce(
    (sum, e) => sum + calcHours(e.startTime, e.endTime, e.breakMinutes),
    0
  );

  const handleSave = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt");

      const dateString = date.toLocaleDateString("sv-SE");

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      const userName = `${profile?.first_name || ""} ${
        profile?.last_name || ""
      }`.trim();

      const { data: timesheet } = await supabase
        .from("timesheets")
        .insert({
          user_id: user.id,
          date: dateString,
          total_hours: totalHours,
          coworker_name: activeCoWorker,
        })
        .select()
        .single();

      const preparedEntries = entries
        .filter((e) => e.startTime && e.endTime)
        .map((e) => ({
          timesheet_id: timesheet.id,
          location: e.location,
          service: e.service,
          number: e.number,
          name: e.name,
          activity: e.activity || "",
          start_time: e.startTime,
          end_time: e.endTime,
          break_minutes: Number(e.breakMinutes || 0),
          hours: calcHours(e.startTime, e.endTime, e.breakMinutes),
        }));

      await supabase.from("timesheet_entries").insert(preparedEntries);

      const pdfBytes = await generateTimeSheetPdf({
        date,
        activeCoWorker,
        totalHours,
        userName,
        entries: preparedEntries,
      });

      const filePath = `${user.id}/${timesheet.id}.pdf`;

      await supabase.storage.from("timesheets").upload(filePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

      const { data: urlData } = supabase.storage
        .from("timesheets")
        .getPublicUrl(filePath);

      await supabase
        .from("timesheets")
        .update({ pdf_url: urlData.publicUrl })
        .eq("id", timesheet.id);

      onSaved?.();
      setOpenTimeSheet(false);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern des Stundenzettels");
    } finally {
      setLoading(false);
    }
  };

  console.log(initialCoWorker);
  return (
    <>
      <Dialog open={open && !initialCoWorker} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography fontWeight={600}>
            Stunden – {date.toLocaleDateString("de-DE")}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Typography mb={2}>
            Bitte wähle einen Mitarbeiter aus, für den ein Stundenzettel
            erstellt werden soll:
          </Typography>

          <TextField
            select
            label="Mitarbeiter"
            value={activeCoWorker}
            onChange={(e) => setActiveCoWorker(e.target.value)}
            fullWidth
          >
            {coWorkerData.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setOpenTimeSheet(true);
              onClose();
            }}
          >
            Weiter
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openTimeSheet}
        onClose={() => setOpenTimeSheet(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <DialogTitle
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Typography fontWeight={600}>
              Stunden – {date.toLocaleDateString("de-DE")}
            </Typography>

            {!editMode && (
              <IconButton onClick={() => setEditMode(true)}>
                <EditIcon />
              </IconButton>
            )}
          </DialogTitle>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Typography>Lade…</Typography>
          ) : (
            <Stack spacing={3}>
              <Typography>{activeCoWorker}</Typography>
              {entries.map((e, i) => (
                <Box
                  key={e.id}
                  p={2}
                  border="1px solid #e5e7eb"
                  borderRadius={2}
                >
                  <Stack spacing={2}>
                    <TextField
                      label="Ort"
                      value={e.location}
                      onChange={(ev) => {
                        const c = [...entries];
                        c[i].location = ev.target.value;
                        setEntries(c);
                      }}
                      disabled={!editMode}
                    />

                    <Box display="flex" gap={2}>
                      <TextField
                        label="Start"
                        type="time"
                        value={e.startTime}
                        onChange={(ev) => {
                          const c = [...entries];
                          c[i].startTime = ev.target.value;
                          setEntries(c);
                        }}
                        disabled={!editMode}
                      />
                      <TextField
                        label="Ende"
                        type="time"
                        value={e.endTime}
                        onChange={(ev) => {
                          const c = [...entries];
                          c[i].endTime = ev.target.value;
                          setEntries(c);
                        }}
                        disabled={!editMode}
                      />
                    </Box>

                    <TextField
                      label="Leistung"
                      value={e.service}
                      onChange={(ev) => {
                        const c = [...entries];
                        c[i].service = ev.target.value;
                        setEntries(c);
                      }}
                      disabled={!editMode}
                    />

                    <TextField
                      label="Nummer"
                      value={e.number}
                      onChange={(ev) => {
                        const c = [...entries];
                        c[i].number = ev.target.value;
                        setEntries(c);
                      }}
                      disabled={!editMode}
                    />

                    <Box display="flex" justifyContent="space-between">
                      <Typography fontWeight={500}>
                        {calcHours(e.startTime, e.endTime).toFixed(2)} h
                      </Typography>
                      {editMode && (
                        <IconButton
                          color="error"
                          onClick={() =>
                            setEntries(entries.filter((x) => x.id !== e.id))
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Stack>
                </Box>
              ))}

              {editMode && (
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={() =>
                    setEntries([
                      ...entries,
                      {
                        id: crypto.randomUUID(),
                        location: "Zwiesel",
                        startTime: "",
                        endTime: "",
                        service: "",
                        number: "",
                        name: "",
                      },
                    ])
                  }
                >
                  Eintrag hinzufügen
                </Button>
              )}

              <Divider />

              <Typography fontWeight={600}>
                Gesamt: {totalHours.toFixed(2)} Stunden
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenTimeSheet(false)}>Schließen</Button>
          {editMode && (
            <Button variant="contained" color="success" onClick={handleSave}>
              Speichern
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
