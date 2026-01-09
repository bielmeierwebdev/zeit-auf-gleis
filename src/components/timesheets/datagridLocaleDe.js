export const dataGridLocaleDE = {
  // === Column menu ===
  columnMenuSortAsc: "Aufsteigend sortieren",
  columnMenuSortDesc: "Absteigend sortieren",
  columnMenuUnsort: "Sortierung aufheben",
  columnMenuFilter: "Filtern",
  columnMenuHideColumn: "Spalte ausblenden",
  columnMenuManageColumns: "Spalten verwalten",

  // === Filter panel labels ===
  filterPanelColumns: "Spalte",
  filterPanelOperator: "Operator",
  filterPanelInputLabel: "Wert",
  filterPanelInputPlaceholder: "Filterwert",

  // === Filter operators (JETZT KOMPLETT) ===
  filterOperatorContains: "enthält",
  filterOperatorDoesNotContain: "enthält nicht",

  filterOperatorEquals: "ist gleich",
  filterOperatorDoesNotEqual: "ist nicht gleich",

  filterOperatorStartsWith: "beginnt mit",
  filterOperatorEndsWith: "endet mit",

  filterOperatorIsEmpty: "ist leer",
  filterOperatorIsNotEmpty: "ist nicht leer",

  filterOperatorIsAnyOf: "ist einer von",

  // === General ===
  noRowsLabel: "Keine Daten vorhanden",
  noResultsOverlayLabel: "Keine Ergebnisse gefunden",

  // === Footer / selection ===
  footerRowSelected: (count) =>
    count !== 1
      ? `${count} Zeilen ausgewählt`
      : `${count} Zeile ausgewählt`,
};
