import { getAggregatedPerformance, getPaginatedOfficerStats } from "../services/officer_analytics/performanceService.js";

export async function getPerformanceMetrics(req, res) {
  try {
    const { from, to, officerId, department, subcity } = req.query;

    const data = await getAggregatedPerformance({ from, to, officerId, department, subcity });

    const stats = data.globalStats[0] || {
      totalRequestsProcessed: 0,
      totalAssigned: 0,
      avgResponseTimeMs: 0,
      communicationResponseRate: 0,
      applicationResponseRate: 0,
      combinedResponseRate: 0
    };

    let officerPerformanceData = [];

    if (data.officerPerformance) {
      data.officerPerformance.forEach(officerData => {
        officerPerformanceData.push({
          officerId: officerData._id,
          fullName: officerData.officer.fullName,
          email: officerData.officer.email,
          onLeave: officerData.officer.onLeave,
          department: officerData.officer.department,
          totalApplications: officerData.totalApplications,
          totalConversations: officerData.totalConversations,
          avgResponseTimeMs: officerData.avgResponseTimeMs,
          requestsProcessed: officerData.requestsProcessed,
          applicationResponseRate: officerData.applicationResponseRate,
          communicationResponseRate: officerData.communicationResponseRate,
          rankScore: officerData.rankScore,
          normalizedScore: officerData.normalizedScore
        })
      })
    }


    res.json({
      data: {
        summary: {
          totalRequestsProcessed: stats.totalRequestsProcessed,
          totalTasksAssigned: stats.totalAssigned,
          averageResponseTimeMs: stats.avgResponseTimeMs || 0,
          communicationResponseRate: stats.communicationResponseRate || 0,
          applicationResponseRate: stats.applicationResponseRate || 0,
          combinedResponseRate: stats.combinedResponseRate || 0
        },
        // return copies so further sorting won't mutate the original array
        topPerformers: [...officerPerformanceData], // Full list sorted desc in service
        worstPerformers: [...officerPerformanceData].sort((a, b) => {
          const diff = (a.rawScore || a.normalizedScore || 0) - (b.rawScore || b.normalizedScore || 0);
          if (Math.abs(diff) > 0.0001) return diff;
          return (a.requestsTotal || 0) - (b.requestsTotal || 0);
        }), // Full list sorted asc
        monthlyTrend: data.monthlyTrend || []
      },
      success: true,
      error: null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch performance metrics" });
  }
}

/**
 * GET /api/v1/admin/metrics/officers
 * Detailed: Paginated list of officers with results.
 */
export async function getOfficerPerformance(req, res) {
  try {
    const { from, to, department, subcity, search, page, limit } = req.query;

    const results = await getPaginatedOfficerStats({
      from,
      to,
      department,
      subcity,
      search,
      page,
      limit
    });

    res.json({
      success: true,
      data: results,
      counts: results.counts, // Explicitly expose counts at top level or within data
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch officer performance list" });
  }
}
