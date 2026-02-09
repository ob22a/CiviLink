import ExcelJS from 'exceljs';

export async function generatePerformanceExcel(data, { from, to, department, subcity }) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CiviLink Admin';
    workbook.created = new Date();

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
    const filterInfo = [
        ['Report Period:', `${from || 'All Time'} to ${to || 'Present'}`],
        ['Department:', department || 'All Departments'],
        ['Subcity:', subcity || 'All Subcities'],
        [] // Empty row spacer
    ];

    // 1. Overview Sheet
    const overviewSheet = workbook.addWorksheet('Overview');
    overviewSheet.addRows(filterInfo);

    // Add Header for Metrics
    const metricHeaderRow = overviewSheet.addRow(['Metric', 'Value']);
    metricHeaderRow.font = { bold: true };

    const overviewData = [
        ['Total Tasks Assigned', Number(stats.totalAssigned)],
        ['Total Tasks Processed', Number(stats.totalRequestsProcessed)],
        ['Avg Response Time (s)', Number((stats.avgResponseTimeMs || 0) / 1000)],
        ['Combined Response Rate', Number(stats.combinedResponseRate)],
        ['Comm. Response Rate', Number(stats.communicationResponseRate)],
        ['App. Response Rate', Number(stats.applicationResponseRate)]
    ];

    overviewData.forEach(row => {
        const r = overviewSheet.addRow(row);
        if (row[0].includes('Rate')) {
            r.getCell(2).numFmt = '0.0%';
        } else if (row[0].includes('Time')) {
            r.getCell(2).numFmt = '0.00"s"';
        } else {
            r.getCell(2).numFmt = '#,##0';
        }
    });

    overviewSheet.getColumn(1).width = 30;
    overviewSheet.getColumn(2).width = 25;
    overviewSheet.getColumn(1).font = { bold: true };

    // 2. Performance Sheets
    const topSheet = workbook.addWorksheet('Top Performers');
    const worstSheet = workbook.addWorksheet('Worst Performers');
    const allSheet = workbook.addWorksheet('All Officers');

    const sortedOfficers = [...allOfficers].sort((a, b) => (b.normalizedScore || 0) - (a.normalizedScore || 0));

    setupOfficerSheet(topSheet, sortedOfficers, filterInfo, 'Top Performers');
    setupOfficerSheet(worstSheet, [...sortedOfficers].reverse(), filterInfo, 'Bottom Performers');
    setupOfficerSheet(allSheet, allOfficers, filterInfo, 'Full Officer List');

    // 3. Monthly Trend
    const trendSheet = workbook.addWorksheet('Monthly Report');
    trendSheet.addRows(filterInfo);

    const trendHeader = trendSheet.addRow(['Month', 'Requests Processed', 'Avg Response Time (ms)', 'Response Rate']);
    trendHeader.font = { bold: true };

    monthlyTrend.forEach(m => {
        const rate = (m.communicationResponseRate || m.applicationResponseRate || 0);
        trendSheet.addRow([
            m.month,
            Number(m.requestsProcessed || 0),
            Number(m.averageResponseTimeMs || 0),
            Number(rate)
        ]);
    });

    trendSheet.getColumn(2).numFmt = '#,##0';
    trendSheet.getColumn(3).numFmt = '#,##0';
    trendSheet.getColumn(4).numFmt = '0.0%';
    trendSheet.getColumn(1).width = 15;
    trendSheet.getColumn(2).width = 20;
    trendSheet.getColumn(3).width = 22;
    trendSheet.getColumn(4).width = 20;

    return workbook;
}

function setupOfficerSheet(sheet, officers, filterInfo, title) {
    // Add Title and Filters at the top
    sheet.addRow([title]).font = { bold: true, size: 14 };
    sheet.addRows(filterInfo);

    const headers = [
        'Rank', 'Name', 'Department', 'Subcity',
        'Tasks Assigned', 'Tasks Processed', 'Avg Response Time (ms)',
        'Response Rate', 'Weighted Score', 'Performance %'
    ];

    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
    headerRow.alignment = { horizontal: 'center' };

    officers.forEach((o, i) => {
        const name = o.name || `${o.officer?.firstName || o.officer?.fullName || 'Unknown'} ${o.officer?.lastName || ''}`.trim();

        // Unified Response Rate (prefers combinedResponseRate from service which is 0-100)
        let rateValue = 0;
        if (typeof o.combinedResponseRate === 'number') {
            rateValue = o.combinedResponseRate / 100;
        } else if (typeof o.responseRate === 'number') {
            rateValue = o.responseRate / 100;
        } else {
            rateValue = (o.communicationResponseRate || 0) || (o.applicationResponseRate || 0);
        }

        // Unified Avg Response Time (ms)
        const avgTime = Number(o.avgResponseTimeMs || o.combinedAvgResponseTimeMs || o.avgResponseTime || 0);
        const perfValue = (o.normalizedScore || o.score || 0) / 100;

        const row = sheet.addRow([
            i + 1,
            name,
            o.department || o.officer?.department || 'N/A',
            o.subcity || o.officer?.subcity || 'N/A',
            Number(o.requestsTotal || 0),
            Number(o.requestsProcessed || 0),
            avgTime,
            Number(rateValue),
            Number(o.rawScore || 0),
            Number(perfValue)
        ]);

        // Middle alignment for numbers
        row.alignment = { horizontal: 'center' };
        row.getCell(2).alignment = { horizontal: 'left' }; // Name stays left
    });

    // Column Formats
    const colFormats = [
        { col: 5, fmt: '#,##0' },
        { col: 6, fmt: '#,##0' },
        { col: 7, fmt: '#,##0' },
        { col: 8, fmt: '0.0%' },
        { col: 9, fmt: '0.0000' },
        { col: 10, fmt: '0.0%' }
    ];

    colFormats.forEach(cf => {
        sheet.getColumn(cf.col).numFmt = cf.fmt;
    });

    // Widths
    sheet.getColumn(1).width = 8;
    sheet.getColumn(2).width = 30;
    sheet.getColumn(3).width = 22;
    sheet.getColumn(4).width = 20;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 15;
    sheet.getColumn(7).width = 22;
    sheet.getColumn(8).width = 15;
    sheet.getColumn(9).width = 15;
    sheet.getColumn(10).width = 15;

    sheet.autoFilter = {
        from: { row: headerRow.number, column: 1 },
        to: { row: headerRow.number, column: 10 }
    };
}
