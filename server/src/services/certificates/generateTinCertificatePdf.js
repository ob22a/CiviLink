import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateTinCertificatePdf = async (certificateId, formData, issuedBy, issuedDate) => {
  if (process.env.NODE_ENV === "test") {
    return "/fake/path/tin.pdf";
  } else {
    const certificatesDir = path.join(
      process.cwd(),
      "certificates_pdfs",
      "tin"
    );

    // Ensure directory exists
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    const filePath = path.join(certificatesDir, `${certificateId}.pdf`);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ---- PDF CONTENT ---- //

/* ================= HEADER ================= */
    doc
      .fontSize(12)
      .text("Addis Ababa City Administration", {
        align: "center",
      });

    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    /* ================= TOP RIGHT INFO ================= */
    const topY = doc.y;

    doc
      .fontSize(9)
      .text("TIN:", 350, topY)
      .text(formData.tin, 450, topY);

    doc.text("Date of Issuance:", 350, topY + 15)
      .text(issuedDate, 450, topY + 15);

    /* ================= PHOTO BOX ================= */
    doc.rect(40, topY, 100, 120).stroke();
    doc.fontSize(8).text("Photo", 70, topY + 50);

    doc.moveDown(7);

    /* ================= TITLE ================= */
    doc
      .fontSize(14)
      .text("Business License", { align: "center", underline: true })
      .moveDown(1);

    doc.fontSize(10)
      .text("This an official certificate for:");

    doc.moveDown(1.5);

    /* ================= TWO COLUMN BODY ================= */
    const leftX = 40;
    const rightX = 300;
    let y = doc.y;

    function field(label, value, x, y) {
      doc.fontSize(9).text(label, x, y);
      doc.fontSize(9).text(value, x + 80, y);
    }

    field("1. Name:", formData.personal.firstName + " " + formData.personal.middleName + " " + formData
      .personal.lastName, leftX, y);
    field("2. Nationality:", "Ethiopian", rightX, y);

    y += 20;
    field("3. Address:", formData.addressDetails.city + ", " + formData.addressDetails.streetAddress, leftX, y);
    field("4. Email:", formData.personal.email, rightX, y);

    y += 20;
    field("5. Occupation:", formData.employmentDetails.occupation, leftX, y);
    field("6. Issued Place:", formData.addressDetails.city, rightX, y);


    /* ================= SIGNATURE & STAMP ================= */
    y += 40;
    doc.text(`Issued by: ${issuedBy}`, leftX, y);

    doc
      .rect(350, y - 10, 150, 80)
      .stroke()
      .fontSize(8)
      .text("Official Stamp", 390, y + 20);

    /* ================= FOOTER ================= */
    doc.fontSize(8)
      .text(
        "N.B. This license shall be renewed in accordance with Proclamation No. 980/2008 as per the fiscal year.",
        40,
        750
     );

    // ---- END CONTENT ----

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
    });
  };
};