import SecurityLog from "../models/SecurityLog.js";
import {
  exportSecurityLogs,
  buildSecurityFilter,
} from "../utils/securityExport.js";
import fs from "fs";
import path from "path"; // Add this import

export const getSecurityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = buildSecurityFilter(req.query);

    const logs = await SecurityLog.find(filter)
      .sort({ timeOfAttempt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      reports: logs.map((log) => ({
        timeOfAttempt: log.timeOfAttempt,
        attemptType: log.attemptType,
        count: log.count,
        officerName: log.officerName,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const exportSecurityLogsController = async (req, res) => {
  try {
    const filter = buildSecurityFilter(req.query);
    const format = req.query.format || "json"; // 'json' or 'excel'

    const exportResult = await exportSecurityLogs(filter, format);

    // Return appropriate response based on environment
    if (exportResult.type === "base64") {
      // For production/Render - send base64 data
      res.status(200).json({
        success: true,
        type: "base64",
        data: exportResult.data,
        filename: exportResult.filename,
        contentType: exportResult.contentType,
        message: exportResult.message,
      });
    } else {
      // For development - send file URL
      res.status(200).json({
        success: true,
        type: "file",
        downloadUrl: exportResult.downloadUrl,
        filename: exportResult.filename,
        message: exportResult.message,
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add a download endpoint for development
export const downloadExportedFile = async (req, res) => {
  try {
    const { filename } = req.params;

    // Security check: ensure filename is safe
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid filename",
      });
    }

    const filePath = path.join(process.cwd(), "exports", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Determine content type based on file extension
    let contentType = "application/octet-stream";
    if (filename.endsWith(".json")) {
      contentType = "application/json";
    } else if (filename.endsWith(".xlsx")) {
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
