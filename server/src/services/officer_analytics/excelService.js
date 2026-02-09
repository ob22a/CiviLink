import ExcelJS from 'exceljs';

export async function generatePerformanceExcel(data, { from, to, department, subcity }) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CiviLink Admin';
    workbook.created = new Date();

    // Fallbacks for global stats to prevent "toFixed" crashes
    const stats = (data.globalStats && data.globalStats[0]) || {
        totalRequestsProcessed: 0,
        totalAssigned: 0,
        avgResponseTimeMs: 0,
        communicationResponseRate: 0,
        applicationResponseRate: 0,
        combinedResponseRate: 0
    };

    const allOfficers = data.officerPerformance || [];
    const monthlyTrend = data.monthlyTrend || [];

    // 1. Overview Sheet
    const summarySheet = workbook.addWorksheet('Overview');
    summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 25 },
    ];

    summarySheet.addRows([
        { metric: 'Report Period', value: `${from || 'All'} to ${to || 'All'}` },
        { metric: 'Department Filter', value: department || 'All' },
        { metric: 'Subcity Filter', value: subcity || 'All' },
        { metric: 'Total Tasks Assigned', value: stats.totalAssigned },
        { metric: 'Total Tasks Processed', value: stats.totalRequestsProcessed },
        { metric: 'Avg Response Time', value: `${((stats.avgResponseTimeMs || 0) / 1000).toFixed(2)}s` },
        { metric: 'Combined Response Rate', value: `${((stats.combinedResponseRate || 0) * 100).toFixed(1)}%` },
        { metric: 'Comm. Response Rate', value: `${((stats.communicationResponseRate || 0) * 100).toFixed(1)}%` },
        { metric: 'App. Response Rate', value: `${((stats.applicationResponseRate || 0) * 100).toFixed(1)}%` },
    ]);

    // Formatting: Bold the first column
    summarySheet.getColumn(1).font = { bold: true };
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };

    // 2. Top Performers (Ranked by normalizedScore descending)
    const topSheet = workbook.addWorksheet('Top Performers');
    const sortedTop = [...allOfficers].sort((a, b) => {
        const diff = (b.normalizedScore || 0) - (a.normalizedScore || 0);
        if (Math.abs(diff) > 0.0001) return diff;
        // Tie-breaker: total requests (volume)
        return (b.requestsTotal || 0) - (a.requestsTotal || 0);
    });
    setupOfficerSheet(topSheet, sortedTop);

    // 3. Worst Performers (Ranked by normalizedScore ascending)
    const worstSheet = workbook.addWorksheet('Worst Performers');
    const sortedWorst = [...allOfficers].sort((a, b) => {
        const diff = (a.normalizedScore || 0) - (b.normalizedScore || 0);
        if (Math.abs(diff) > 0.0001) return diff;
        // Tie-breaker: total requests (lower volume comes first in worst performers)
        return (a.requestsTotal || 0) - (b.requestsTotal || 0);
    });
    setupOfficerSheet(worstSheet, sortedWorst);

    // 4. Monthly Report
    const trendSheet = workbook.addWorksheet('Monthly Report');
    trendSheet.columns = [
        { header: 'Month', key: 'month', width: 15 },
        { header: 'Requests Processed', key: 'requests', width: 20 },
        { header: 'Avg Response Time (ms)', key: 'time', width: 22 },
        { header: 'Comm. Response Rate', key: 'rate', width: 20 },
    ];

    trendSheet.getRow(1).font = { bold: true };

    monthlyTrend.forEach(m => {
        const rate = (m.communicationResponseRate || m.applicationResponseRate || 0);
        trendSheet.addRow({
            month: m.month,
            requests: Number(m.requestsProcessed || 0),
            time: Number(m.averageResponseTimeMs || 0),
            rate: Number(rate)
        });
    });

    // Formatting monthly trend
    trendSheet.getColumn('requests').numFmt = '#,##0';
    trendSheet.getColumn('time').numFmt = '#,##0';
    trendSheet.getColumn('rate').numFmt = '0.0%';
    trendSheet.autoFilter = 'A1:D1';

    // 5. All Officers Database
    const allSheet = workbook.addWorksheet('All Officers');
    setupOfficerSheet(allSheet, allOfficers);

    return workbook;
}

function setupOfficerSheet(sheet, officers) {
    sheet.columns = [
        { header: 'Rank', key: 'rank', width: 8, style: { alignment: { horizontal: 'center' } } },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Department', key: 'dept', width: 22 },
        { header: 'Subcity', key: 'subcity', width: 20 },
        { header: 'Tasks Assigned', key: 'assigned', width: 15, style: { alignment: { horizontal: 'center' } } },
        { header: 'Tasks Processed', key: 'processed', width: 15, style: { alignment: { horizontal: 'center' } } },
        { header: 'Avg Response Time (ms)', key: 'time', width: 22, style: { numFmt: '#,##0', alignment: { horizontal: 'center' } } },
        { header: 'Response Rate', key: 'rate', width: 15, style: { numFmt: '0.0%', alignment: { horizontal: 'center' } } },
        { header: 'Weighted Score', key: 'score', width: 15, style: { numFmt: '0.0000', alignment: { horizontal: 'center' } } },
        { header: 'Performance %', key: 'perf', width: 15, style: { numFmt: '0.0%', alignment: { horizontal: 'center' } } },
    ];

    // Style the header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    officers.forEach((o, i) => {
        const firstName = o.officer?.firstName || o.officer?.fullName || 'Unknown';
        const lastName = o.officer?.lastName || '';

        // Ensure values are numbers for Excel
        const rateValue = (typeof o.combinedResponseRate === 'number') ? (o.combinedResponseRate / 100) : ((o.communicationResponseRate || 0) || (o.applicationResponseRate || 0));
        const timeValue = (typeof o.combinedAvgResponseTimeMs === 'number') ? o.combinedAvgResponseTimeMs : (o.avgResponseTimeMs || 0);
        const scoreValue = o.rawScore || o.rankScore || 0;
        const perfValue = (o.normalizedScore || 0) / 100; // Convert 0-100 to 0-1 for % format

        sheet.addRow({
            rank: i + 1,
            name: `${firstName} ${lastName}`.trim(),
            dept: o.officer?.department || 'N/A',
            subcity: o.officer?.subcity || 'N/A',
            assigned: Number(o.requestsTotal || 0),
            processed: Number(o.requestsProcessed || 0),
            time: Number(timeValue),
            rate: Number(rateValue),
            score: Number(scoreValue),
            perf: Number(perfValue)
        });
    });

    // Add filter on top
    sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: 10 }
    };
}
