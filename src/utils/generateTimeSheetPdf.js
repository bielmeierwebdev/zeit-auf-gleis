import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import logoUrl from "../assets/ZeitAufGleis-Logo.png";

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
     LOGO
  =============================== */
  const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);

  const logoWidth = 120;
  const logoHeight = (logoImage.height / logoImage.width) * logoWidth;

  page.drawImage(logoImage, {
    x: width - logoWidth - 40,
    y: height - logoHeight - 40,
    width: logoWidth,
    height: logoHeight,
  });

  let y = height - 60;

  /* ===============================
     HEADER
  =============================== */
  page.drawText("Stundenzettel", {
    x: 40,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0.12, 0.31, 0.54),
  });

  y -= 26;

  page.drawText(`Name: ${userName}`, { x: 40, y, size: 11, font });
  y -= 16;

  page.drawText(
    `Datum: ${new Date(date).toLocaleDateString("de-DE")}`,
    { x: 40, y, size: 11, font }
  );

  y -= 28;

  /* ===============================
     TABELLENHEADER
  =============================== */

  const columns = [
    "Datum",
    "Ort",
    "Start",
    "Ende",
    "Leistung",
    "Nummer",
    "Name",
  ];

  const colX = [40, 95, 155, 205, 265, 370, 430];

  columns.forEach((col, i) => {
    page.drawText(col, {
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

  y -= 14;

  /* ===============================
     EINTRÄGE
  =============================== */

  console.log(entries);

  entries.forEach((entry) => {
    page.drawText(
      new Date(date).toLocaleDateString("de-DE"),
      { x: colX[0], y, size: 9, font }
    );

    page.drawText(entry.location ?? "", {
      x: colX[1],
      y,
      size: 9,
      font,
    });

    page.drawText(entry.start_time ?? "", {
      x: colX[2],
      y,
      size: 9,
      font,
    });

    page.drawText(entry.end_time ?? "", {
      x: colX[3],
      y,
      size: 9,
      font,
    });

    page.drawText(entry.service ?? "", {
      x: colX[4],
      y,
      size: 9,
      font,
    });

    page.drawText(entry.number ?? "", {
      x: colX[5],
      y,
      size: 9,
      font,
    });

    page.drawText(entry.name ?? "", {
      x: colX[6],
      y,
      size: 9,
      font,
    });

    y -= 14;

    // Seitenumbruch
    if (y < 80) {
      y = height - 60;
      pdfDoc.addPage();
    }
  });

  y -= 10;

  page.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  y -= 22;

  page.drawText(`Gesamtstunden: ${totalHours.toFixed(2)} h`, {
    x: 40,
    y,
    size: 13,
    font: boldFont,
  });

  y -= 36;

  page.drawText(
    `Erstellt am: ${new Date().toLocaleDateString("de-DE")}`,
    {
      x: 40,
      y,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    }
  );

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}
