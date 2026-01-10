export const box = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mb: 3,
};

export const weekDaysBox = {
  display: "grid",
  gridTemplateColumns: "48px repeat(7, minmax(0, 1fr))",
  gap: 1,
  mb: 1,
};

export const calendarGridBox = {
  display: "grid",
  gridTemplateColumns: "48px repeat(7, minmax(0, 1fr))",
  gap: 1,
  mb: 1,
};

export const day = {
  aspectRatio: "1 / 1",
  width: "100%",
  minWidth: 0,
  borderRadius: 3,
  fontSize: 14,
  fontWeight: 500,
  p: 0.5,
};

export const dayBox = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export const coworkersBox = {
  display: "flex",
  justifyContent: "center",
  gap: 0.5,
  mt: 0.5,
};

export const coworkersDot = {
  width: 6,
  height: 6,
  borderRadius: "50%",
};
