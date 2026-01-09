import { FormControl, Select, MenuItem } from "@mui/material";

function TableFilter({ value, onChange }) {
  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <MenuItem value="none">Kein Filter</MenuItem>
        <MenuItem value="week">Diese Woche</MenuItem>
        <MenuItem value="month">Dieser Monat</MenuItem>
      </Select>
    </FormControl>
  );
}

export default TableFilter;
