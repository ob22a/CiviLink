import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateTinCertificatePdf = async (certificateId, formData) => {
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

    // ---- PDF CONTENT ----

    /* ========= Helpers ========== */
    const LABEL_X = 50;
    const VALUE_X = 160;
    const RIGHT_LABEL_X = 330;
    const RIGHT_VALUE_X = 420;
    const ROW_HEIGHT = 20;

    let currentY = doc.y;

    function drawField(label, value, xLabel, xValue, y) {
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(label, xLabel, y, { width: 100 });

      doc
        .font("Helvetica")
        .fontSize(11)
        .text(value ?? "—", xValue, y, { width: 140 });
    }

    function nextRow() {
      currentY += ROW_HEIGHT;
    }


  /* ========== SECTION TITLE =========== */

    function section(title) {
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(title, LABEL_X, currentY);

      currentY += 25;

      doc
        .moveTo(LABEL_X, currentY)
        .lineTo(545, currentY)
        .stroke();

      currentY += 15;
    }

    /* ========== Personal Information =========== */

    section("Personal Information");

    drawField("First Name", formData.personal.firstName, LABEL_X, VALUE_X, currentY);
    drawField("Last Name", formData.personal.lastName, RIGHT_LABEL_X, RIGHT_VALUE_X, currentY);
    nextRow();

    drawField("Middle Name", formData.personal.middleName, LABEL_X, VALUE_X, currentY);
    drawField("Gender", formData.personal.gender, RIGHT_LABEL_X, RIGHT_VALUE_X, currentY);
    nextRow();

    drawField("Date of Birth", formData.personal.dateOfBirth, LABEL_X, VALUE_X, currentY);
    drawField("Email", formData.personal.email, RIGHT_LABEL_X, RIGHT_VALUE_X, currentY);
    nextRow();

    drawField("Bank Account No.", formData.personal.bankAccountNumber, LABEL_X, VALUE_X, currentY);
    drawField("FAN", formData.personal.FAN, RIGHT_LABEL_X, RIGHT_VALUE_X, currentY);
    nextRow();


    /* ========= Employment Details ======== */

    section("Employment Details");

    drawField("Occupation", formData.employmentDetails.occupation, LABEL_X, VALUE_X, currentY);
    drawField("Employer Name", formData.employmentDetails.employerName, RIGHT_LABEL_X, RIGHT_VALUE_X, currentY);
    nextRow();

    drawField("Employer Address", formData.employmentDetails.employerAddress, LABEL_X, VALUE_X, currentY);
    nextRow();


    /* ======== Address Details ========= */

    section("Address Details");

    drawField("Street Address", formData.addressDetails.streetAddress, LABEL_X, VALUE_X, currentY);
    drawField("City", formData.addressDetails.city, RIGHT_LABEL_X, RIGHT_VALUE_X, currentY);
    nextRow();

    drawField("Region", formData.addressDetails.region, LABEL_X, VALUE_X, currentY);
    drawField("Subcity", formData.subcity, RIGHT_LABEL_X, RIGHT_VALUE_X, currentY);
    nextRow();

    drawField("Postal Code", formData.addressDetails.postalCode, LABEL_X, VALUE_X, currentY);
    nextRow();


    /* ======== TIN Section ========= */

    currentY += 30;

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Issued Tax Identification Number (TIN)", LABEL_X, currentY, {
        align: "center",
        width: 500,
      });

    currentY += 20;

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(formData.tin, LABEL_X, currentY, {
        align: "center",
        width: 500,
      });

    // ---- END CONTENT ----

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
    });
  };
};