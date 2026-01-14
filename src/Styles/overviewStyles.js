export const box = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  overflow: { xs: "auto", md: "hidden" },
};

export const mainBox = {
  flex: 1,
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  gap: 3,
  p: { xs: 2, md: 3 },
  overflow: { xs: "visible", md: "hidden" },
};

export const leftPanel = {
  width: { xs: "100%", md: 420 },
  minWidth: { md: 420 },
  display: "flex",
  flexDirection: "column",
  gap: 3,
  height: { xs: "auto", md: "100%" }, // 👈 wichtig
  minHeight: 0,
};

export const rightPanel = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
};
