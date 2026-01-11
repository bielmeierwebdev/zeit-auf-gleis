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
import IconDelete from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid } from "@mui/x-data-grid";
import { dataGridLocaleDE } from "./datagridLocaleDe";
import TableFilter from "./TableFilter";
import { generateStundenblattPdf } from "../../utils/generateStundenblattPdf";
import { useTheme, useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Error from "../../Error";

export default function TimeSheetsPanel({ openForDate, reloadKey, onReload }) {
  const [userId, setUserId] = useState(null);

  const [timeSheets, setTimeSheets] = useState([]);
  const [stundenblaetter, setStundenblaetter] = useState([]);
  const [deleteType, setDeleteType] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedSheet, setSelectedSheet] = useState(null);
  const [selectionModel, setSelectionModel] = useState([]);
  const [rowSelectionModel, setRowSelectionModel] = useState({
    type: "include",
    ids: new Set(),
  });

  const [dateFilter, setDateFilter] = useState("none");
  const [nameFilter, setNameFilter] = useState("all");
  const [dateFilterStundenblaetter, setDateFilterStundenblaetter] =
    useState("none");
  const [nameFilterStundenblaetter, setNameFilterStundenblaetter] =
    useState("all");

  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  const [openDelete, setOpenDelete] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCreateStundenblatt() {
    console.log(filteredTimeSheets);
    console.log(rowSelectionModel);

    const selectedIds = Array.from(rowSelectionModel.ids ?? []);

    const selectedSheets = filteredTimeSheets.filter((s) =>
      selectedIds.includes(s.id)
    );

    if (selectedSheets.length === 0) {
      alert("Bitte mindestens einen Stundenzettel auswählen.");
      return;
    }

    const hasDifferentCoworkers = (rows) => {
      const names = new Set(rows.map((r) => r.coworker_name));
      return names.size > 1;
    };

    // Verwendung
    if (hasDifferentCoworkers(selectedSheets)) {
      setErrorOpen(true);
      setErrorMessage("Bitte nur Dateien mit dem gleichen Mitarbeiter auswählen.");
      return;
    }

    const coworkerName = selectedSheets[0].coworker_name;

    const { data: entries } = await supabase
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

    const sheetsWithEntries = selectedSheets.map((sheet) => ({
      ...sheet,
      timesheet_entries: entries.filter((e) => e.timesheet_id === sheet.id),
    }));

    const pdf = await generateStundenblattPdf({
      coworkerName,
      sheets: sheetsWithEntries,
    });

    const filePath = `${userId}/stundenblatt-${Date.now()}.pdf`;

    await supabase.storage.from("stundenblaetter").upload(filePath, pdf, {
      contentType: "application/pdf",
      upsert: true,
    });

    const { data } = supabase.storage
      .from("stundenblaetter")
      .getPublicUrl(filePath);

    console.log(userId);
    await supabase.from("stundenblaetter").insert({
      user_id: userId,
      coworker_name: coworkerName,
      from_date: selectedSheets.at(-1).date,
      to_date: selectedSheets[0].date,
      total_hours: selectedSheets.reduce((sum, s) => sum + s.total_hours, 0),
      pdf_url: data.publicUrl,
    });

    onReload?.();
  }

  useEffect(() => {
    console.log("Row Selection Model:", rowSelectionModel);
  }, [rowSelectionModel]);

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
    if (nameFilter !== "all") {
      const normalized = sheet.coworker_name?.toLowerCase() ?? "";
      if (!normalized.includes(nameFilter)) return false;
    }

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

  console.log("Filtered Time Sheets:", filteredTimeSheets);

  const filteredStundenblaetter = stundenblaetter.filter((sheet) => {
    if (nameFilterStundenblaetter !== "all") {
      const normalized = sheet.coworker_name?.toLowerCase() ?? "";
      if (!normalized.includes(nameFilterStundenblaetter)) return false;
    }

    if (dateFilterStundenblaetter === "none") return true;
    const d = new Date(sheet.from_date);
    const now = new Date();
    if (dateFilterStundenblaetter === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return d >= start && d < end;
    }
    if (dateFilterStundenblaetter === "month") {
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

    onReload?.();
    setOpenDelete(false);
    setSelectedSheet(null);
  };

  const handleDeleteStundenblatt = async () => {
    if (!activeSheet) return;

    try {
      // 1️⃣ PDF aus Storage löschen
      if (activeSheet.pdf_url) {
        // publicUrl → storage path extrahieren
        const path = activeSheet.pdf_url.split("/stundenblaetter/")[1];

        await supabase.storage.from("stundenblaetter").remove([path]);
      }

      // 2️⃣ DB-Eintrag löschen
      await supabase.from("stundenblaetter").delete().eq("id", activeSheet.id);

      // 3️⃣ UI aktualisieren
      onReload?.();
      setOpenDelete(false);
      setSelectedSheet(null);
      setActiveSheet(null);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen des Stundenblatts");
    }
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
      renderCell: (p) => (
        <>
          <IconButton
            onClick={() =>
              openForDate(new Date(p.row.date), p.row.coworker_name)
            }
          >
            <EditIcon />
          </IconButton>

          <IconButton onClick={() => window.open(p.row.pdf_url)}>
            <DownloadIcon />
          </IconButton>

          <IconButton
            color="error"
            onClick={() => {
              setActiveSheet(p.row);
              setDeleteType("timesheet");
              setOpenDelete(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const mobileColumns = [
    {
      field: "date",
      headerName: "Tag",
      flex: 1,
      valueFormatter: (v) =>
        new Date(v).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
        }),
    },
    {
      field: "coworker_name",
      headerName: "Name",
      flex: 1.2,
    },
    {
      field: "total_hours",
      headerName: "h",
      width: 70,
      valueFormatter: (v) => `${v.toFixed(2)}`,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: (p) => (
        <IconButton
          size="small"
          onClick={() => openForDate(new Date(p.row.date), p.row.coworker_name)}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  /* ===============================
     RENDER
  =============================== */
  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      gap={3}
      alignItems="stretch"
    >
      {/* TIMESHEETS */}
      <Box
        display="flex"
        flexDirection="column"
        gap={3}
        flex={showPreview ? "1 1 0%" : "1 1 100%"}
        minWidth={0}
      >
        <Paper
          sx={{
            p: 3,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            height: { xs: 520, md: 380 },
          }}
        >
          {/* HEADER */}
          <Box mb={2}>
            {/* Titel + Actions */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h6">Alle Stundenzettel</Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                {/* Desktop Button */}
                {!isMobile && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const allIds = filteredTimeSheets.map((r) => r.id);
                        const isAllSelected =
                          rowSelectionModel.ids.size === allIds.length;

                        setRowSelectionModel({
                          type: "include",
                          ids: isAllSelected ? new Set() : new Set(allIds),
                        });
                      }}
                    >
                      {rowSelectionModel.ids.size === filteredTimeSheets.length
                        ? "Auswahl löschen"
                        : "Alle auswählen"}
                    </Button>

                    <Button
                      variant="contained"
                      disabled={rowSelectionModel.length === 0}
                      onClick={handleCreateStundenblatt}
                    >
                      Stundenblatt erstellen
                    </Button>
                  </>
                )}

                {/* Mobile IconButton */}
                {isMobile && (
                  <IconButton
                    color="primary"
                    disabled={rowSelectionModel.length === 0}
                    onClick={handleCreateStundenblatt}
                  >
                    <AddIcon />
                  </IconButton>
                )}

                <IconButton onClick={() => setShowPreview((p) => !p)}>
                  {showPreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Stack>
            </Box>

            {/* FILTER – IMMER UNTER TITEL */}
            <Box>
              <TableFilter
                value={dateFilter}
                onChange={setDateFilter}
                nameFilter={nameFilter}
                setNameFilter={setNameFilter}
              />
            </Box>
          </Box>
          {}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <DataGrid
              rows={filteredTimeSheets}
              columns={isMobile ? mobileColumns : columns}
              checkboxSelection
              onRowClick={(p) => setSelectedSheet(p.row)}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              rowSelectionModel={rowSelectionModel}
              sx={{
                "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
                  {
                    display: "none",
                  },
              }}
              onRowSelectionModelChange={(model) => setRowSelectionModel(model)}
              localeText={dataGridLocaleDE}
              pageSizeOptions={isMobile ? [5] : [10, 25, 100]}
            />
          </Box>
        </Paper>
        {/* STUNDENBLÄTTER */}
        <Paper
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: { xs: 520, md: 380 },
          }}
        >
          {/* HEADER: Titel */}
          <Box mb={1.5}>
            <Typography variant="h6">Stundenblätter</Typography>
          </Box>

          {/* FILTER: immer volle Breite */}
          <Box mb={2}>
            <TableFilter
              value={dateFilterStundenblaetter}
              onChange={setDateFilterStundenblaetter}
              nameFilter={nameFilterStundenblaetter}
              setNameFilter={setNameFilterStundenblaetter}
            />
          </Box>

          {/* TABLE */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {stundenblaetter.length > 0 ? (
              <DataGrid
                rows={filteredStundenblaetter}
                onRowClick={(p) => setSelectedSheet(p.row)}
                columns={[
                  {
                    field: "from_date",
                    headerName: "Zeitraum",
                    flex: 1,
                    valueFormatter: (v) =>
                      v
                        ? new Date(v).toLocaleDateString("de-DE", {
                            month: "long",
                            year: "numeric",
                          })
                        : "",
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
                      <>
                        <IconButton onClick={() => window.open(p.row.pdf_url)}>
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setActiveSheet(p.row);
                            setDeleteType("stundenblatt");
                            setOpenDelete(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ),
                  },
                ]}
                localeText={dataGridLocaleDE}
              />
            ) : (
              <Typography>Keine Stundenblätter vorhanden</Typography>
            )}
          </Box>
        </Paper>
      </Box>

      {/* PREVIEW */}
      {showPreview && (
        <Paper
          sx={{
            p: 3,
            flex: { xs: "none", md: "1 1 0%" },
            minWidth: 0,
            height: { xs: 400, md: "auto" },
            display: "flex",
            alignSelf: "stretch",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" mb={2}>
            Vorschau
          </Typography>

          {selectedSheet?.pdf_url ? (
            <Box
              flex={1}
              border="1px solid #e5e7eb"
              borderRadius={2}
              overflow="hidden"
              sx={{ minHeight: 0 }}
            >
              <iframe
                src={selectedSheet.pdf_url}
                width="100%"
                height="100%"
                style={{ border: "none", pointerEvents: "auto" }}
              />
            </Box>
          ) : (
            <Typography color="text.secondary">
              Wähle einen Stundenzettel aus.
            </Typography>
          )}
        </Paper>
      )}

      {/* DELETE DIALOG */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        keepMounted={false}
      >
        <DialogTitle>
          {deleteType === "stundenblatt"
            ? "Stundenblatt löschen"
            : "Stundenzettel löschen"}
        </DialogTitle>

        <DialogContent dividers>
          <Typography>
            {deleteType === "stundenblatt"
              ? "Möchtest du dieses Stundenblatt wirklich löschen?"
              : "Möchtest du diesen Stundenzettel wirklich löschen?"}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Abbrechen</Button>

          <Button
            color="error"
            onClick={() => {
              if (deleteType === "stundenblatt") {
                handleDeleteStundenblatt();
              } else {
                handleDelete();
              }
            }}
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
      <Error
        message={errorMessage}
        open={errorOpen}
        setOpen={setErrorOpen}
        setErrorMessage={setErrorMessage}
      />
    </Box>
  );
}
