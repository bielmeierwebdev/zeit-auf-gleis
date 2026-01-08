import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import { timeSheetsMock } from "./timeSheetsMock";

export default function TimeSheetsPanel() {
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  return (
    <Box display="flex" height="100%" width="100%" gap={3}>
      {/* TABELLE */}
      <Paper
        sx={{
          p: 3,
          flex: showPreview ? "1 1 0%" : "1 1 100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          transition: "flex 0.3s ease",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6">Alle Stundenzettel</Typography>

          <Button
            variant="outlined"
            color="success"
            onClick={() => setShowPreview((p) => !p)}
          >
            {showPreview ? "Vorschau ausblenden" : "Vorschau einblenden"}
          </Button>
        </Box>

        <Box flex={1} overflow="auto">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Zeitraum</TableCell>
                <TableCell>Stunden</TableCell>
                <TableCell>Erstellt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeSheetsMock.map((sheet) => (
                <TableRow
                  key={sheet.id}
                  hover
                  selected={selectedSheet?.id === sheet.id}
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSelectedSheet(sheet)}
                >
                  <TableCell>
                    {sheet.dateFrom} – {sheet.dateTo}
                  </TableCell>
                  <TableCell>{sheet.totalHours} h</TableCell>
                  <TableCell>{sheet.createdAt}</TableCell>
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
            flex: "2 1 0%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            transition: "flex 0.3s ease",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Vorschau
          </Typography>

          {selectedSheet ? (
            <Box
              flex={1}
              border="1px solid #e5e7eb"
              borderRadius={2}
              overflow="hidden"
            >
              <iframe
                src={selectedSheet.fileUrl}
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            </Box>
          ) : (
            <Typography color="text.secondary">
              Wählen Sie einen Stundenzettel aus.
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}
