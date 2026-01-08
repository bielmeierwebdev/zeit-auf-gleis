import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  IconButton
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import { useEffect, useState } from "react"

export default function TimeSheetModal({
  open,
  onClose,
  date
}) {
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [timeSheet, setTimeSheet] = useState(null)

  useEffect(() => {
    if (!open || !date) return

    const load = async () => {
      setLoading(true)

      // 🔜 später Supabase
      // const existing = await fetchTimeSheet(date)

      const existing = null // mock: keiner vorhanden

      setTimeSheet(
        existing ?? {
          date,
          startTime: "",
          endTime: "",
          breakMinutes: 30,
          note: ""
        }
      )

      setEditMode(!existing)
      setLoading(false)
    }

    load()
  }, [open, date])

  if (!date) return null

    return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        Stunden – {date.toLocaleDateString("de-DE")}

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
            <TextField
              label="Startzeit"
              type="time"
              value={timeSheet.startTime}
              disabled={!editMode}
              onChange={(e) =>
                setTimeSheet({ ...timeSheet, startTime: e.target.value })
              }
            />

            <TextField
              label="Endzeit"
              type="time"
              value={timeSheet.endTime}
              disabled={!editMode}
              onChange={(e) =>
                setTimeSheet({ ...timeSheet, endTime: e.target.value })
              }
            />

            <TextField
              label="Pause (Minuten)"
              type="number"
              value={timeSheet.breakMinutes}
              disabled={!editMode}
              onChange={(e) =>
                setTimeSheet({ ...timeSheet, breakMinutes: e.target.value })
              }
            />

            <TextField
              label="Notiz"
              multiline
              rows={3}
              value={timeSheet.note}
              disabled={!editMode}
              onChange={(e) =>
                setTimeSheet({ ...timeSheet, note: e.target.value })
              }
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>

        {editMode && (
          <Button variant="contained" color="success">
            Speichern
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
