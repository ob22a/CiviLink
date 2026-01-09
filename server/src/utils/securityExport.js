import SecurityLog from "../models/SecurityLog.js";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

/**
 * Export security logs with Render-compatible approach
 * - In production/Render: Returns base64 data (no file system usage)
 * - In development: Saves to local file system
 */
export const exportSecurityLogs = async (filter, format = "json") => {
  const logs = await SecurityLog.find(filter).lean();

  // Handle different formats
  if (format.toLowerCase() === "excel") {
    return await exportToExcel(logs);
  } else {
    return await exportToJson(logs);
  }
};

/**
 * Export logs to JSON format
 */
const exportToJson = async (logs) => {
  const jsonData = JSON.stringify(logs, null, 2);
  const fileName = `security_logs_${Date.now()}.json`;

  const base64Data = Buffer.from(jsonData).toString("base64");

  return {
    type: "base64",
    data: base64Data,
    filename: fileName,
    contentType: "application/json",
    message: "Logs exported as base64 encoded JSON data",
  };
};

/**
 * Export logs to Excel format
 */
const exportToExcel = async (logs) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Security Logs");

  // Add headers with styling
  worksheet.columns = [
    { header: "Timestamp", key: "timeOfAttempt", width: 25 },
    { header: "Attempt Type", key: "attemptType", width: 20 },
    { header: "Officer Name", key: "officerName", width: 25 },
    { header: "Success", key: "success", width: 12 },
    { header: "Count", key: "count", width: 10 },
    { header: "IP Address", key: "ipAddress", width: 18 },
    { header: "User Agent", key: "userAgent", width: 35 },
    { header: "Additional Info", key: "details", width: 30 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  logs.forEach((log) => {
    worksheet.addRow({
      timeOfAttempt: log.timeOfAttempt
        ? new Date(log.timeOfAttempt).toLocaleString()
        : "N/A",
      attemptType: log.attemptType || "N/A",
      officerName: log.officerName || "N/A",
      success: log.success ? "✅ Yes" : "❌ No",
      count: log.count || 1,
      ipAddress: log.ipAddress || "N/A",
      userAgent: log.userAgent || "N/A",
      details: log.details ? JSON.stringify(log.details) : "N/A",
    });
  });

  // Auto-filter on header row
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: worksheet.columnCount },
  };

  const fileName = `security_logs_${Date.now()}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const base64Data = buffer.toString("base64");

  return {
    type: "base64",
    data: base64Data,
    filename: fileName,
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    message: "Logs exported as base64 encoded Excel file",
  };
};

/**
 * Check if we're in production or Render environment
 */
const isProductionEnvironment = () => {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.RENDER === "true" ||
    process.env.VERCEL === "true" ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined
  );
};

/**
 * Build filter for security logs based on query parameters
 */
export const buildSecurityFilter = (query) => {
  const filter = {};

  // Date range filtering
  if (query.from || query.to) {
    filter.timeOfAttempt = {};
    if (query.from) {
      const fromDate = new Date(query.from);
      fromDate.setHours(0, 0, 0, 0);
      filter.timeOfAttempt.$gte = fromDate;
    }
    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      filter.timeOfAttempt.$lte = toDate;
    }
  }

  // Minimum attempt count
  if (query.attemptCountMin) {
    const minCount = Number(query.attemptCountMin);
    if (!isNaN(minCount)) {
      filter.count = { $gte: minCount };
    }
  }

  // Failed attempts only
  if (query.failedOnly === "true") {
    filter.success = false;
  }

  // After hours only (9 AM to 5 PM)
  if (query.afterHoursOnly === "true") {
    filter.$expr = {
      $or: [
        { $lt: [{ $hour: "$timeOfAttempt" }, 9] },
        { $gte: [{ $hour: "$timeOfAttempt" }, 17] },
      ],
    };
  }

  // Officer name search
  if (query.officerName) {
    filter.officerName = { $regex: query.officerName, $options: "i" };
  }

  // Attempt type filter
  if (query.attemptType) {
    filter.attemptType = query.attemptType;
  }

  // Success filter (true/false)
  if (query.success === "true" || query.success === "false") {
    filter.success = query.success === "true";
  }

  return filter;
};

/**
 * Utility to clean up old export files (run periodically)
 */
export const cleanupOldExports = (maxAgeHours = 24) => {
  if (isProductionEnvironment()) {
    // In production, files aren't stored locally
    return { cleaned: 0, message: "No local files to clean in production" };
  }

  const exportsDir = path.join(process.cwd(), "exports");
  if (!fs.existsSync(exportsDir)) {
    return { cleaned: 0, message: "Exports directory does not exist" };
  }

  const files = fs.readdirSync(exportsDir);
  const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;
  let cleanedCount = 0;

  files.forEach((file) => {
    const filePath = path.join(exportsDir, file);
    const stats = fs.statSync(filePath);

    if (stats.mtimeMs < cutoffTime) {
      fs.unlinkSync(filePath);
      cleanedCount++;
    }
  });

  return {
    cleaned: cleanedCount,
    message: `Cleaned ${cleanedCount} old export files`,
  };
};
