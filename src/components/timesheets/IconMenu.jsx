import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Divider, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AddIcon from "@mui/icons-material/AddCircleOutlined";
import ChecklistIcon from "@mui/icons-material/Checklist";

export default function IconMenu({
  showPreview,
  setShowPreview,
  filteredTimeSheets,
  rowSelectionModel,
  setRowSelectionModel,
  setShowFilter,
  showFilter
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        id="demo-positioned-button"
        aria-controls={open ? "demo-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <SettingsIcon />
      </IconButton>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          onClick={() => {
            setShowPreview((p) => !p);
            handleClose();
          }}
        >
          {showPreview ? (
            <>
              <VisibilityIcon sx={{ mr: 2 }} />
              Vorschau ausblenden
            </>
          ) : (
            <>
              <VisibilityOffIcon sx={{ mr: 2 }} />
              Vorschau einblenden
            </>
          )}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowFilter((p) => !p);
            handleClose();
          }}
        >
            {showFilter ? (
            <>
              <VisibilityIcon sx={{ mr: 2 }} />
              Filter ausblenden
            </>
          ) : (
            <>
              <VisibilityOffIcon sx={{ mr: 2 }} />
              Filter einblenden
            </>
          )}
        </MenuItem>
        <Divider></Divider>
        <MenuItem
          onClick={() => {
            const allIds = filteredTimeSheets.map((r) => r.id);
            const isAllSelected = rowSelectionModel.ids.size === allIds.length;

            setRowSelectionModel({
              type: "include",
              ids: isAllSelected ? new Set() : new Set(allIds),
            });
          }}
        >
          <ChecklistIcon sx={{ mr: 2 }} />
          {rowSelectionModel.ids.size === filteredTimeSheets.length
            ? "Auswahl löschen"
            : "Alle auswählen"}
        </MenuItem>
      </Menu>
    </div>
  );
}

/***<Button
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
                    </Button> */
