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
  Divider,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { generateTimeSheetPdf } from "../../utils/generateTimeSheetPdf";

// 🔢 Stundenberechnung
function calcHours(start, end, pauseMinutes) {
  if (!start || !end) return 0;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const minutes = eh * 60 + em - (sh * 60 + sm) - Number(pauseMinutes || 0);
  return Math.max(minutes / 60, 0);
}

export default function TimeSheetModal({ open, onClose, date, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  //const [timesheetId, setTimesheetId] = useState(null);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!open || !date) return;

    const load = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const dateString = date.toLocaleDateString("sv-SE");

      const { data: timesheet } = await supabase
        .from("timesheets")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", dateString)
        .single();

      if (!timesheet) {
        //setTimesheetId(null);
        setEntries([
          {
            id: crypto.randomUUID(),
            activity: "",
            startTime: "",
            endTime: "",
            breakMinutes: 0,
          },
        ]);
        setEditMode(true);
        setLoading(false);
        return;
      }

      const { data: entriesData } = await supabase
        .from("timesheet_entries")
        .select("id, activity, start_time, end_time, break_minutes")
        .eq("timesheet_id", timesheet.id)
        .order("start_time");

      //setTimesheetId(timesheet.id);
      setEntries(
        entriesData.map((e) => ({
          id: e.id,
          activity: e.activity,
          startTime: e.start_time,
          endTime: e.end_time,
          breakMinutes: e.break_minutes,
        }))
      );
      setEditMode(false);
      setLoading(false);
    };

    load();
  }, [open, date]);

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
        .upsert(
          {
            user_id: user.id,
            date: dateString,
            total_hours: totalHours,
          },
          { onConflict: "user_id,date" }
        )
        .select()
        .single();

      await supabase
        .from("timesheet_entries")
        .delete()
        .eq("timesheet_id", timesheet.id);

      const preparedEntries = entries
        .filter((e) => e.startTime && e.endTime)
        .map((e) => ({
          timesheet_id: timesheet.id,
          activity: e.activity || "",
          start_time: e.startTime,
          end_time: e.endTime,
          break_minutes: Number(e.breakMinutes || 0),
          hours: calcHours(e.startTime, e.endTime, e.breakMinutes),
        }));

      await supabase.from("timesheet_entries").insert(preparedEntries);

      const pdfBytes = await generateTimeSheetPdf({
        date,
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

      setEditMode(false);
      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern des Stundenzettels");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography fontWeight={600}>
          Stunden – {date.toLocaleDateString("de-DE")}
        </Typography>

        {!editMode && (
          <IconButton onClick={() => setEditMode(true)}>
            <EditIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Typography>Lade…</Typography>
        ) : (
          <Stack spacing={3}>
            {entries.map((entry, index) => (
              <Box
                key={entry.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                  backgroundColor: { xs: "#fafafa", md: "transparent" },
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ md: "center" }}
                >
                  <TextField
                    label="Tätigkeit"
                    value={entry.activity}
                    disabled={!editMode}
                    onChange={(e) => {
                      const copy = [...entries];
                      copy[index].activity = e.target.value;
                      setEntries(copy);
                    }}
                    fullWidth
                  />

                  <Box
                    display="flex"
                    gap={2}
                    flexDirection={{ xs: "column", md: "row" }}
                    alignItems={{ md: "center" }}
                  >
                    <TextField
                      label="Start"
                      type="time"
                      value={entry.startTime}
                      disabled={!editMode}
                      onChange={(e) => {
                        const copy = [...entries];
                        copy[index].startTime = e.target.value;
                        setEntries(copy);
                      }}
                      sx={{ width: { xs: "100%", md: 120 } }}
                    />

                    <TextField
                      label="Ende"
                      type="time"
                      value={entry.endTime}
                      disabled={!editMode}
                      onChange={(e) => {
                        const copy = [...entries];
                        copy[index].endTime = e.target.value;
                        setEntries(copy);
                      }}
                      sx={{ width: { xs: "100%", md: 120 } }}
                    />

                    <TextField
                      label="Pause (min)"
                      type="number"
                      value={entry.breakMinutes}
                      disabled={!editMode}
                      onChange={(e) => {
                        const copy = [...entries];
                        copy[index].breakMinutes = e.target.value;
                        setEntries(copy);
                      }}
                      sx={{ width: { xs: "100%", md: 110 } }}
                    />
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                  >
                    <Typography fontWeight={500}>
                      {calcHours(
                        entry.startTime,
                        entry.endTime,
                        entry.breakMinutes
                      ).toFixed(2)}{" "}
                      h
                    </Typography>

                    {editMode && (
                      <IconButton
                        color="error"
                        onClick={() =>
                          setEntries(entries.filter((e) => e.id !== entry.id))
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
                      activity: "",
                      startTime: "",
                      endTime: "",
                      breakMinutes: 0,
                    },
                  ])
                }
              >
                Tätigkeit hinzufügen
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
        <Button onClick={onClose}>Schließen</Button>

        {editMode && (
          <Button variant="contained" color="success" onClick={handleSave}>
            Speichern
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
