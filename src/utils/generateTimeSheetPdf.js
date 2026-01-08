import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import logoUrl from "../assets/ZeitAufGleis-Logo.png"; // 👈 Pfad anpassen

export async function generateTimeSheetPdf({
  userName,
  date,
  entries,
  totalHours,
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();

  /* ===============================
     LOGO EINBETTEN
  =============================== */

  const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);

  const logoWidth = 140;
  const logoHeight =
    (logoImage.height / logoImage.width) * logoWidth;

  page.drawImage(logoImage, {
    x: width - logoWidth - 50,
    y: height - logoHeight - 40,
    width: logoWidth,
    height: logoHeight,
  });

  let y = height - 60;

  /* ===============================
     HEADER TEXT
  =============================== */

  page.drawText("Stundenzettel", {
    x: 50,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0.12, 0.31, 0.54),
  });

  y -= 30;

  page.drawText(`Name: ${userName}`, {
    x: 50,
    y,
    size: 12,
    font,
  });

  y -= 18;

  page.drawText(
    `Datum: ${new Date(date).toLocaleDateString("de-DE")}`,
    {
      x: 50,
      y,
      size: 12,
      font,
    }
  );

  y -= 30;

  /* ===============================
     TABELLENHEADER
  =============================== */

  const columns = ["Tätigkeit", "Von", "Bis", "Pause", "Std"];
  const colX = [50, 260, 320, 380, 450];

  columns.forEach((col, i) => {
    page.drawText(col, {
      x: colX[i],
      y,
      size: 11,
      font: boldFont,
    });
  });

  y -= 10;

  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  y -= 15;

  /* ===============================
     EINTRÄGE
  =============================== */

  entries.forEach((entry) => {
    page.drawText(entry.activity ?? "", { x: colX[0], y, size: 11, font });
    page.drawText(entry.start_time ?? "", { x: colX[1], y, size: 11, font });
    page.drawText(entry.end_time ?? "", { x: colX[2], y, size: 11, font });
    page.drawText(`${entry.break_minutes ?? 0} min`, {
      x: colX[3],
      y,
      size: 11,
      font,
    });
    page.drawText((entry.hours ?? 0).toFixed(2), {
      x: colX[4],
      y,
      size: 11,
      font,
    });

    y -= 18;
  });

  y -= 10;

  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  y -= 25;

  page.drawText(`Gesamtstunden: ${totalHours.toFixed(2)} h`, {
    x: 50,
    y,
    size: 14,
    font: boldFont,
  });

  y -= 40;

  page.drawText(
    `Erstellt am: ${new Date().toLocaleDateString("de-DE")}`,
    {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    }
  );

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}
