import { FormControl, Select, MenuItem, Box } from "@mui/material";

function TableFilter({ value, onChange, nameFilter, setNameFilter }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2}}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select value={nameFilter} onChange={(e) => setNameFilter(e.target.value)}>
          <MenuItem value="all">Alle</MenuItem>
          <MenuItem value="maria">Maria RZ</MenuItem>
          <MenuItem value="mahmoud">Mahmoud RZ</MenuItem>
          <MenuItem value="thaer">Thaer RZ</MenuItem>
          <MenuItem value="moaaz">Moaaz RZ</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select value={value} onChange={(e) => onChange(e.target.value)}>
          <MenuItem value="none">Kein Filter</MenuItem>
          <MenuItem value="week">Diese Woche</MenuItem>
          <MenuItem value="month">Dieser Monat</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default TableFilter;
