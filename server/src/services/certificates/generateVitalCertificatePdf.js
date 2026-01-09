import PDFDocument from "pdfkit";
import { supabase } from "../../../config/supabase.js";

export const generateVitalScheduleCardPdf = async (certificateData, appointmentData, formData, issuedBy) => {
  if (process.env.NODE_ENV === "test") {
    return "/fake/path/tin.pdf";
  } else {

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    let buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {});


    // ---- PDF CONTENT ---- //

/* ================= HEADER ================= */
    doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("Civil Registration Appointment Confirmation", {
      align: "center",
    }).stroke();

  doc.moveDown(1);

  /* ---------------- DISCLAIMER ---------------- */
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("red")
    .text("IMPORTANT NOTICE", { align: "center" });

  doc
    .font("Helvetica")
    .fillColor("black")
    .text(
      `This document is NOT a ${certificateData.type} certificate.\n` +
        "It only confirms your appointment for civil registration.",
      { align: "center" }
    );

    doc.moveDown(2);

    /* ---------------- APPLICANT DETAILS ---------------- */
    doc.font("Helvetica-Bold").fontSize(13).text("Applicant Details");
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(11);
    doc.text(`Application Type: ${certificateData.type.toUpperCase()}`);

    if (formData?.fullName) {
        doc.text(`Full Name: ${formData.personal.firstName + " " + formData.personal.middleName + " " + formData
      .personal.lastName}`);
    }

    doc.moveDown(1.5);

    /* ---------------- APPOINTMENT DETAILS ---------------- */
    doc.font("Helvetica-Bold").fontSize(13).text("Appointment Information");
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(11);
    doc.text(`Date: ${appointmentData.date}`);
    doc.text(`Time Slot: ${appointmentData.slot}`);
    doc.text(`Time Range: ${appointmentData.timeRange}`);
    doc.text(`Subcity: ${formData.subcity}`);

    doc.moveDown(1.5);

    /* ---------------- REQUIRED DOCUMENTS ---------------- */
    doc.font("Helvetica-Bold").fontSize(13).text("Documents You Must Bring");
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(11);

    const requiredDocs =
        certificateData.type === "birth"
        ? [
            "Parents’ valid identification",
            "Birth notification from health facility",
            "Parents’ marriage certificate (if applicable)",
            ]
        : [
            "Valid identification of both parties",
            "Birth certificates of both parties",
            "Witness identification documents",
            ];

    requiredDocs.forEach((docItem) => {
        doc.text(`• ${docItem}`);
    });

    doc.moveDown(1.5);

    /* ---------------- ATTENDANCE NOTICE ---------------- */
    doc
        .font("Helvetica")
        .fontSize(10)
        .text(
        "Failure to appear on the scheduled date may require submitting a new application."
        );

    doc.moveDown(2);

    /* ---------------- FOOTER ---------------- */
    doc
        .fontSize(9)
        .fillColor("gray")
        .text(`Issued by: ${issuedBy}`, { align: "left" })
        .text(`Issue Date: ${certificateData.createdAt.toISOString().split("T")[0]}`, {
        align: "left",
        });

    // ---- END CONTENT ----

    doc.end();

    await new Promise((resolve) => doc.on("end", resolve));

    const pdfBuffer = Buffer.concat(buffers);
    const filePath = `certificates/vital/${certificateData._id}.pdf`;

    // Upload to Supabase
    const { error } = await supabase.storage
      .from("certificates")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
    });

    if (error) throw new Error(error.message);

    return filePath;
  };
};