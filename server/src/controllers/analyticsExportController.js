import { getAggregatedPerformance } from "../services/officer_analytics/performanceService.js";
import { generatePerformanceExcel } from "../services/officer_analytics/excelService.js";

export async function exportPerformanceReport(req, res) {
    // Check if it can be downloaded I don't want to send the excel stream 
    try {
        const { from, to, department, subcity } = req.query;
        // Optional filename provided by client (without extension preferred)
        const rawFileName = req.query.filename || '';
        const data = await getAggregatedPerformance({ from, to, department, subcity });

        // Generate workbook via dedicated service
        const workbook = await generatePerformanceExcel(data, { from, to, department, subcity });

        // Prepare filename (sanitize and ensure .xlsx extension)
        const sanitize = (name) => {
            if (!name) return '';
            // Remove path separators and control chars, keep letters, numbers, space, dash and underscore
            return name.replace(/[^a-zA-Z0-9 \-_.]/g, '').trim();
        };

        let fileName = `performance_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        const clientName = sanitize(rawFileName);
        if (clientName) {
            fileName = clientName.endsWith('.xlsx') ? clientName : `${clientName}.xlsx`;
        }

        // Stream response
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + fileName
        );

        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition"); // Important react download

        await workbook.xlsx.write(res);
        res.status(200).end();

    } catch (err) {
        console.error("Export Error:", err);
        // If headers are already sent, we can't send a JSON error
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to generate Excel report" });
        }
    }
}
