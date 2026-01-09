import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import logoUrl from "../assets/ZeitAufGleis-Logo.png";

function drawWrappedText({
  page,
  text,
  x,
  y,
  maxWidth,
  font,
  size,
  lineHeight = size + 2,
}) {
  if (!text) return 0;

  const words = String(text).split(",");
  let line = "";
  let lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line},${words[i]}` : words[i];
    const textWidth = font.widthOfTextAtSize(testLine, size);

    if (textWidth > maxWidth) {
      lines.push(line);
      line = words[i];
    } else {
      line = testLine;
    }
  }

  if (line) lines.push(line);

  lines.forEach((l, i) => {
    page.drawText(l, {
      x,
      y: y - i * lineHeight,
      size,
      font,
    });
  });

  return lines.length * lineHeight;
}

export async function generateStundenblattPdf({ coworkerName, sheets }) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let y = height - 60;

  /* ===============================
     LOGO
  =============================== */
  const logoBytes = await fetch(logoUrl).then((r) => r.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);

  const logoWidth = 120;
  const logoHeight = (logoImage.height / logoImage.width) * logoWidth;

  page.drawImage(logoImage, {
    x: width - logoWidth - 40,
    y: height - logoHeight - 40,
    width: logoWidth,
    height: logoHeight,
  });

  /* ===============================
     HEADER
  =============================== */
  page.drawText("Stundenblatt", {
    x: 40,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0.12, 0.31, 0.54),
  });

  y -= 26;
  page.drawText(`Name: ${coworkerName}`, { x: 40, y, size: 11, font });

  y -= 30;

  /* ===============================
     TABELLEN-KONFIG
  =============================== */
  const colX = [40, 90, 150, 200, 260, 360];
  const colWidth = [45, 55, 45, 45, 95, 80];
  const headers = ["Datum", "Ort", "Start", "Ende", "Leistung", "Nummer"];

  let gesamtStunden = 0;

  /* ===============================
     TAGE
  =============================== */
  for (const sheet of sheets) {
    // Seitenumbruch vor neuem Tag
    if (y < 140) {
      page = pdfDoc.addPage([595, 842]);
      y = height - 60;
    }

    /* Tagesüberschrift */
    page.drawText(new Date(sheet.date).toLocaleDateString("de-DE"), {
      x: 40,
      y,
      size: 13,
      font: boldFont,
    });

    y -= 16;

    /* Tabellenkopf */
    headers.forEach((h, i) => {
      page.drawText(h, {
        x: colX[i],
        y,
        size: 9,
        font: boldFont,
      });
    });

    y -= 8;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    y -= 12;

    /* Einträge */
    for (const entry of sheet.timesheet_entries || []) {
      let maxRowHeight = 0;

      page.drawText(new Date(sheet.date).toLocaleDateString("de-DE"), {
        x: colX[0],
        y,
        size: 9,
        font,
      });
      page.drawText(entry.location ?? "", { x: colX[1], y, size: 9, font });
      page.drawText(entry.start_time ?? "", { x: colX[2], y, size: 9, font });
      page.drawText(entry.end_time ?? "", { x: colX[3], y, size: 9, font });
      page.drawText(entry.service ?? "", { x: colX[4], y, size: 9, font });
      //page.drawText(entry.number ?? "", { x: colX[5], y, size: 9, font });

      const numberHeight = drawWrappedText({
        page,
        text: entry.number ?? "",
        x: colX[5],
        y,
        maxWidth: colWidth[5],
        font,
        size: 9,
      });

      maxRowHeight = Math.max(14, numberHeight || 0);

      y -= maxRowHeight + 2;

      if (y < 80) {
        page = pdfDoc.addPage([595, 842]);
        y = height - 60;
      }
    }

    /* Tages-Summe */
    y -= 4;
    page.drawText(`Tagesstunden: ${sheet.total_hours.toFixed(2)} h`, {
      x: 40,
      y,
      size: 10,
      font: boldFont,
    });

    y -= 24;
    gesamtStunden += sheet.total_hours;

    y -= 6;

    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });

    y -= 12;
  }

  /* ===============================
     GESAMTSUMME
  =============================== */
  if (y < 100) {
    page = pdfDoc.addPage([595, 842]);
    y = height - 60;
  }

  page.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  y -= 20;
  page.drawText(`Gesamtstunden: ${gesamtStunden.toFixed(2)} h`, {
    x: 40,
    y,
    size: 14,
    font: boldFont,
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}
