import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from "@mui/material";
import { supabase } from "../../lib/supabase";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid } from "@mui/x-data-grid";
import { dataGridLocaleDE } from "./datagridLocaleDe";
import TableFilter from "./TableFilter";
import { generateStundenblattPdf } from "../../utils/generateStundenblattPdf";

export default function TimeSheetsPanel({ openForDate, reloadKey }) {
  const [userId, setUserId] = useState(null);

  const [timeSheets, setTimeSheets] = useState([]);
  const [stundenblaetter, setStundenblaetter] = useState([]);

  const [selectedSheet, setSelectedSheet] = useState(null);
  const [selectionModel, setSelectionModel] = useState([]);
  const [rowSelectionModel, setRowSelectionModel] = useState({
    type: "include",
    ids: new Set(),
  });

  const [dateFilter, setDateFilter] = useState("none");

  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(true);

  const [openDelete, setOpenDelete] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);

  /* ===============================
     AUTH / USER
  =============================== */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  /* ===============================
     LOAD TIMESHEETS
  =============================== */
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          id,
          date,
          total_hours,
          coworker_name,
          pdf_url,
          timesheet_entries ( location )
        `
        )
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (!error) {
        setTimeSheets(
          (data || []).map((row) => ({
            ...row,
            location: row.timesheet_entries?.[0]?.location || "-",
          }))
        );
      }

      setLoading(false);
    };

    load();
  }, [userId, reloadKey]);

  /* ===============================
     LOAD STUNDENBLÄTTER
  =============================== */
  useEffect(() => {
    if (!userId) return;

    supabase
      .from("stundenblaetter")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setStundenblaetter(data || []));
  }, [userId, reloadKey]);

  /* ===============================
     FILTER
  =============================== */
  const filteredTimeSheets = timeSheets.filter((sheet) => {
    if (dateFilter === "none") return true;

    const d = new Date(sheet.date);
    const now = new Date();

    if (dateFilter === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      return d >= start && d < end;
    }

    if (dateFilter === "month") {
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    }

    return true;
  });

  /* ===============================
     DELETE SINGLE TIMESHEET
  =============================== */
  const handleDelete = async () => {
    if (!activeSheet) return;

    if (activeSheet.pdf_url) {
      const path = activeSheet.pdf_url.split("/timesheets/")[1];
      await supabase.storage.from("timesheets").remove([path]);
    }

    await supabase
      .from("timesheet_entries")
      .delete()
      .eq("timesheet_id", activeSheet.id);

    await supabase.from("timesheets").delete().eq("id", activeSheet.id);

    setOpenDelete(false);
    setSelectedSheet(null);
  };

  /* ===============================
     COLUMNS
  =============================== */
  const columns = [
    {
      field: "date",
      headerName: "Tag",
      flex: 1,
      valueFormatter: (v) => new Date(v).toLocaleDateString("de-DE"),
    },
    { field: "coworker_name", headerName: "Name", flex: 1 },
    {
      field: "total_hours",
      headerName: "Stunden",
      flex: 1,
      valueFormatter: (v) => `${v.toFixed(2)} h`,
    },
    { field: "location", headerName: "Ort", flex: 1 },
    {
      field: "actions",
      headerName: "Aktionen",
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => openForDate(new Date(params.row.date))}>
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => {
              setActiveSheet(params.row);
              setOpenDelete(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  /* ===============================
     RENDER
  =============================== */
  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* TIMESHEETS */}
      <Paper sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6">Alle Stundenzettel</Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TableFilter value={dateFilter} onChange={setDateFilter} />

            <Button
              variant="contained"
              disabled={rowSelectionModel.length === 0}
              onClick={async () => {
                const selectedIds = Array.from(rowSelectionModel.ids ?? []);

                const selectedSheets = filteredTimeSheets.filter((s) =>
                  selectedIds.includes(s.id)
                );

                if (selectedSheets.length === 0) {
                  alert("Bitte mindestens einen Stundenzettel auswählen.");
                  return;
                }

                const coworkerName = selectedSheets[0].coworker_name;

                const { data: entries, error } = await supabase
                  .from("timesheet_entries")
                  .select(
                    `
      timesheet_id,
      location,
      start_time,
      end_time,
      service,
      number
    `
                  )
                  .in("timesheet_id", selectedIds);

                if (error) {
                  console.error(error);
                  alert("Fehler beim Laden der Einträge");
                  return;
                }

                const sheetsWithEntries = selectedSheets.map((sheet) => ({
                  ...sheet,
                  timesheet_entries: entries.filter(
                    (e) => e.timesheet_id === sheet.id
                  ),
                }));

                const pdf = await generateStundenblattPdf({
                  coworkerName,
                  sheets: sheetsWithEntries,
                });

                const filePath = `${userId}/stundenblatt-${Date.now()}.pdf`;

                await supabase.storage
                  .from("stundenblaetter")
                  .upload(filePath, pdf, {
                    contentType: "application/pdf",
                    upsert: true,
                  });

                const { data } = supabase.storage
                  .from("stundenblaetter")
                  .getPublicUrl(filePath);

                await supabase.from("stundenblaetter").insert({
                  user_id: userId,
                  coworker_name: coworkerName,
                  from_date: selectedSheets.at(-1).date,
                  to_date: selectedSheets[0].date,
                  total_hours: selectedSheets.reduce(
                    (sum, s) => sum + s.total_hours,
                    0
                  ),
                  pdf_url: data.publicUrl,
                });
              }}
            >
              Stundenblatt erstellen
            </Button>

            <IconButton onClick={() => setShowPreview((p) => !p)}>
              {showPreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Stack>
        </Stack>

        <DataGrid
          rows={filteredTimeSheets}
          columns={columns}
          checkboxSelection
          onRowSelectionModelChange={(model) => {
            setRowSelectionModel(model);
          }}
          onRowClick={(p) => setSelectedSheet(p.row)}
          autoHeight
          localeText={dataGridLocaleDE}
        />
      </Paper>

      {/* STUNDENBLÄTTER */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Stundenblätter
        </Typography>

        <DataGrid
          rows={stundenblaetter}
          columns={[
            {
              field: "created_at",
              headerName: "Erstellt",
              flex: 1,
              valueFormatter: (v) => new Date(v).toLocaleDateString("de-DE"),
            },
            { field: "coworker_name", headerName: "Name", flex: 1 },
            {
              field: "total_hours",
              headerName: "Stunden",
              flex: 1,
              valueFormatter: (v) => `${v.toFixed(2)} h`,
            },
            {
              field: "actions",
              headerName: "PDF",
              renderCell: (p) => (
                <IconButton
                  onClick={() => {
                    console.log(p);
                    window.open(p.row.pdf_url);
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              ),
            },
          ]}
          autoHeight
          localeText={dataGridLocaleDE}
        />
      </Paper>

      {/* DELETE DIALOG */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Stundenzettel löschen</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Möchtest du diesen Stundenzettel wirklich löschen?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Abbrechen</Button>
          <Button color="error" onClick={handleDelete}>
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
