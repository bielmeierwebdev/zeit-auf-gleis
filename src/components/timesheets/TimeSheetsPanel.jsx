import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { supabase } from "../../lib/supabase";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Tooltip from "@mui/material/Tooltip";

export default function TimeSheetsPanel({ openForDate, reloadKey }) {
  const [timeSheets, setTimeSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);
  const [activeSheet, setActiveSheet] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("timesheets")
        .select("id, date, total_hours, pdf_url, created_at")
        .order("date", { ascending: false });

      console.log(data);

      if (error) {
        console.error(error);
        alert("Fehler beim Laden der Stundenzettel");
      } else {
        setTimeSheets(data);
      }

      setLoading(false);
    };

    load();
  }, [reloadKey]);

  const handleDelete = async () => {
    let sheet = activeSheet;
    try {
      // 1️⃣ PDF löschen
      if (sheet.pdf_url) {
        const path = sheet.pdf_url.split("/timesheets/")[1];
        await supabase.storage.from("timesheets").remove([path]);
      }

      // 2️⃣ Entries löschen
      await supabase
        .from("timesheet_entries")
        .delete()
        .eq("timesheet_id", sheet.id);

      // 3️⃣ Timesheet löschen
      await supabase.from("timesheets").delete().eq("id", sheet.id);

      // 4️⃣ UI aktualisieren
      setSelectedSheet(null);
      //reloadTimeSheets();
      setOpenDelete(false);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      height="100%"
      width="100%"
      gap={3}
    >
      {/* TABELLE */}
      <Paper
        sx={{
          p: 3,
          flex: showPreview ? "1 1 0%" : "1 1 100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6">Alle Stundenzettel</Typography>

          <Tooltip
            title={showPreview ? "Vorschau ausblenden" : "Vorschau einblenden"}
          >
            <IconButton size="small" onClick={() => setShowPreview((p) => !p)}>
              {showPreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box flex={1} overflow="auto">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Tag</TableCell>
                <TableCell>Stunden</TableCell>
                <TableCell>Erstellt</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4}>Lade…</TableCell>
                </TableRow>
              )}

              {!loading && timeSheets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    Noch keine Stundenzettel vorhanden.
                  </TableCell>
                </TableRow>
              )}

              {timeSheets.map((sheet) => (
                <TableRow
                  key={sheet.id}
                  hover
                  selected={selectedSheet?.id === sheet.id}
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSelectedSheet(sheet)}
                >
                  <TableCell>
                    {new Date(sheet.date).toLocaleDateString("de-DE")}
                  </TableCell>

                  <TableCell>{sheet.total_hours.toFixed(2)} h</TableCell>

                  <TableCell>
                    {new Date(sheet.created_at).toLocaleDateString("de-DE")}
                  </TableCell>

                  {/* 👉 AKTIONEN */}
                  <TableCell align="right">
                    <Tooltip title="Bearbeiten">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openForDate(new Date(sheet.date));
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Löschen">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSheet(sheet);
                          setOpenDelete(true);
                          //handleDelete(sheet);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* VORSCHAU */}
      {showPreview && (
        <Paper
          sx={{
            p: 3,
            flex: { xs: "none", md: "2 1 0%" },
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            height: { xs: 400, md: "auto" },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Vorschau
          </Typography>

          {selectedSheet?.pdf_url ? (
            <Box
              flex={1}
              border="1px solid #e5e7eb"
              borderRadius={2}
              overflow="hidden"
            >
              <iframe
                src={selectedSheet.pdf_url}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="Stundenzettel Vorschau"
              />
            </Box>
          ) : (
            <Typography color="text.secondary">
              Wählen Sie einen Stundenzettel aus.
            </Typography>
          )}
        </Paper>
      )}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Stundenzettel löschen</DialogTitle>

        <DialogContent dividers>
          <Typography>
            Möchtest du wirklich den Stundenzettel endgültig löschen?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleDelete}>
            Ändern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
