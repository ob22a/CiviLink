import OfficerStatsMonthly from "../../models/views/OfficerStatsMonthly.js";
import OfficerStatsCumulative from "../../models/views/OfficerStatsCumulative.js";
import GlobalMaxScore from "../../models/views/GlobalMaxScore.js";
import Officer from "../../models/Officer.js";
import { Types } from "mongoose";

/**
 * Fetches the global maximum raw score for normalization.
 */
async function getGlobalMaxScore(period = null) {
    if (period) {
        const record = await GlobalMaxScore.findOne({ period });
        return record?.maxRankScore || 1;
    }
    // For cumulative, get the max from the cumulative collection
    const maxRec = await OfficerStatsCumulative.findOne().sort({ rankScore: -1 });
    return maxRec?.rankScore || 1;
}

export async function getAggregatedPerformance({ from, to, officerId, department, subcity }) {
    const match = {};
    if (from || to) {
        match.period = {};
        if (from) match.period.$gte = from;
        if (to) match.period.$lte = to;
    }
    if (officerId) match.officerId = new Types.ObjectId(officerId);
    if (department) match.department = department;
    if (subcity) match.subcity = subcity;

    // Use monthly collection for ranges and trends
    const results = await OfficerStatsMonthly.aggregate([
        { $match: match },
        {
            $facet: {
                globalStats: [
                    {
                        $group: {
                            _id: null,
                            totalAssigned: { $sum: '$requestsTotal' },
                            totalRequestsProcessed: { $sum: '$requestsProcessed' },
                            // For domain rates, we only average documents that have actual activity in that domain
                            commDocsCount: { $sum: { $cond: [{ $gt: ['$totalConversations', 0] }, 1, 0] } },
                            appDocsCount: { $sum: { $cond: [{ $gt: ['$totalApplications', 0] }, 1, 0] } },
                            sumCommRates: { $sum: { $cond: [{ $gt: ['$totalConversations', 0] }, '$communicationResponseRate', 0] } },
                            sumAppRates: { $sum: { $cond: [{ $gt: ['$totalApplications', 0] }, '$applicationResponseRate', 0] } },
                            // Weighted average response time
                            sumWeightedTime: { $sum: { $multiply: ['$averageResponseTimeMs', '$requestsProcessed'] } }
                        }
                    },
                    {
                        $addFields: {
                            communicationResponseRate: {
                                $cond: [{ $gt: ['$commDocsCount', 0] }, { $divide: ['$sumCommRates', '$commDocsCount'] }, 0]
                            },
                            applicationResponseRate: {
                                $cond: [{ $gt: ['$appDocsCount', 0] }, { $divide: ['$sumAppRates', '$appDocsCount'] }, 0]
                            },
                            avgResponseTimeMs: {
                                $cond: [{ $gt: ['$totalRequestsProcessed', 0] }, { $divide: ['$sumWeightedTime', '$totalRequestsProcessed'] }, 0]
                            }
                        }
                    },
                    {
                        $addFields: {
                            combinedResponseRate: {
                                $cond: [{ $gt: ['$totalAssigned', 0] }, { $divide: ['$totalRequestsProcessed', '$totalAssigned'] }, 0]
                            }
                        }
                    }
                ],
                officerPerformance: [
                    {
                        $group: {
                            _id: '$officerId',
                            totalConversations: { $sum: '$totalConversations' },
                            totalApplications: { $sum: '$totalApplications' },
                            requestsProcessed: { $sum: '$requestsProcessed' },
                            requestsTotal: { $sum: '$requestsTotal' },
                            sumWeightedTime: { $sum: { $multiply: ['$averageResponseTimeMs', '$requestsProcessed'] } }
                        }
                    },
                    {
                        $addFields: {
                            avgResponseTimeMs: {
                                $cond: [{ $gt: ['$requestsProcessed', 0] }, { $divide: ['$sumWeightedTime', '$requestsProcessed'] }, 0]
                            },
                            rawScore: {
                                $cond: [
                                    { $gt: ['$requestsTotal', 0] },
                                    { $multiply: [{ $divide: ['$requestsProcessed', '$requestsTotal'] }, { $ln: { $add: ['$requestsTotal', 1] } }] },
                                    0
                                ]
                            },
                            communicationResponseRate: {
                                $cond: [{ $gt: ['$totalConversations', 0] }, { $divide: ['$processedConversations', '$totalConversations'] }, 0]
                            },
                            applicationResponseRate: {
                                $cond: [{ $gt: ['$totalApplications', 0] }, { $divide: ['$processedApplications', '$totalApplications'] }, 0]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'officer'
                        }
                    },
                    { $unwind: '$officer' },
                    { $sort: { rawScore: -1, requestsTotal: -1 } }
                ],
                monthlyTrend: [
                    {
                        $group: {
                            _id: '$period',
                            totalConversations: { $sum: '$totalConversations' },
                            totalApplications: { $sum: '$totalApplications' },
                            requestsProcessed: { $sum: '$requestsProcessed' },
                            requestsTotal: { $sum: '$requestsTotal' },
                            sumProcessedComm: { $sum: '$processedConversations' },
                            sumProcessedApp: { $sum: '$processedApplications' },
                            sumWeightedTime: { $sum: { $multiply: ['$averageResponseTimeMs', '$requestsProcessed'] } }
                        }
                    },
                    {
                        $project: {
                            month: '$_id',
                            requestsProcessed: '$requestsProcessed',
                            averageResponseTimeMs: {
                                $cond: [{ $gt: ['$requestsProcessed', 0] }, { $divide: ['$sumWeightedTime', '$requestsProcessed'] }, 0]
                            },
                            communicationResponseRate: {
                                $cond: [{ $gt: ['$totalConversations', 0] }, { $divide: ['$sumProcessedComm', '$totalConversations'] }, 0]
                            },
                            applicationResponseRate: {
                                $cond: [{ $gt: ['$totalApplications', 0] }, { $divide: ['$sumProcessedApp', '$totalApplications'] }, 0]
                            },
                            _id: 0
                        }
                    },
                    { $sort: { month: 1 } }
                ]
            }
        }
    ]);

    const data = results[0];
    const globalMax = await getGlobalMaxScore(from === to ? from : null);

    // Apply normalization based on the global distribution and expose rawScore
    if (data.officerPerformance) {
        data.officerPerformance = data.officerPerformance.map(o => {
            const raw = (o.rawScore || 0);
            const normalizedScore = ((raw / (globalMax || 1)) * 100);
            return {
                ...o,
                officerId: o._id,
                rawScore: raw,
                rankScore: raw,
                normalizedScore,
                combinedResponseRate: o.requestsTotal > 0 ? (o.requestsProcessed / o.requestsTotal * 100) : 0,
                combinedAvgResponseTimeMs: o.avgResponseTimeMs
            };
        });
    }

    return data;
}

/**
 * Specifically for the paginated list of officers
 */
export async function getPaginatedOfficerStats({ from, to, department, subcity, search, page = 1, limit = 10 }) {
    const match = {};
    let isFilteredByPeriod = false;

    if (from || to) {
        match.period = {};
        if (from) match.period.$gte = from;
        if (to) match.period.$lte = to;
        isFilteredByPeriod = true;
    }
    if (department) match.department = department;
    if (subcity) match.subcity = subcity;

    if (search) {
        // Since we need to search by officer name/email, we'll still need a lookup if we didn't store them.
        // I'll assume we didn't store name/email in cumulative to keep it lean.
        // Actually, let's look them up if needed.
    }

    const globalMax = await getGlobalMaxScore(from === to ? from : null);

    // Choose Source
    const SourceModel = isFilteredByPeriod ? OfficerStatsMonthly : OfficerStatsCumulative;

    // Build aggregation for pagination
    const aggregate = SourceModel.aggregate([
        { $match: match }
    ]);

    if (isFilteredByPeriod) {
        // If monthly, we must group by officer because there might be multiple months
        aggregate.group({
            _id: '$officerId',
            totalConversations: { $sum: '$totalConversations' },
            totalApplications: { $sum: '$totalApplications' },
            requestsProcessed: { $sum: '$requestsProcessed' },
            requestsTotal: { $sum: '$requestsTotal' },
            sumWeightedTime: { $sum: { $multiply: ['$averageResponseTimeMs', '$requestsProcessed'] } },
            processedConversations: { $sum: '$processedConversations' },
            processedApplications: { $sum: '$processedApplications' },
            department: { $first: '$department' },
            subcity: { $first: '$subcity' }
        });
        aggregate.addFields({
            avgResponseTimeMs: { $cond: [{ $gt: ['$requestsProcessed', 0] }, { $divide: ['$sumWeightedTime', '$requestsProcessed'] }, 0] },
            rawScore: {
                $cond: [
                    { $gt: ['$requestsTotal', 0] },
                    { $multiply: [{ $divide: ['$requestsProcessed', '$requestsTotal'] }, { $ln: { $add: ['$requestsTotal', 1] } }] },
                    0
                ]
            }
        });
    }

    // Sort by score
    aggregate.sort({ rawScore: -1, requestsTotal: -1 });

    // Lookup officer details for search/display
    aggregate.lookup({
        from: 'users',
        localField: isFilteredByPeriod ? '_id' : 'officerId',
        foreignField: '_id',
        as: 'officer'
    });
    aggregate.unwind('$officer');

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        aggregate.match({
            $or: [
                { 'officer.fullName': searchRegex },
                { 'officer.email': searchRegex }
            ]
        });
    }

    // Counts (Total, Active, On Leave)
    const countQuery = {};
    if (department) countQuery.department = department;
    if (subcity) countQuery.subcity = subcity;
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        countQuery.$or = [
            { fullName: searchRegex },
            { email: searchRegex }
        ];
    }

    const [totalCount, activeCount, onLeaveCount] = await Promise.all([
        Officer.countDocuments(countQuery),
        Officer.countDocuments({ ...countQuery, onLeave: { $ne: true } }),
        Officer.countDocuments({ ...countQuery, onLeave: true })
    ]);

    const options = { page: parseInt(page), limit: parseInt(limit) };
    const results = await SourceModel.aggregatePaginate(aggregate, options);

    results.counts = { total: totalCount, active: activeCount, onLeave: onLeaveCount };

    results.docs = results.docs.map(o => {
        const raw = (o.rawScore || 0);
        const combinedResponseRate = o.requestsTotal > 0 ? (o.requestsProcessed / o.requestsTotal) : 0;
        return {
            officerId: o.officerId || o._id,
            name: o.officer?.fullName || 'Unknown',
            department: o.department || o.officer.department,
            subcity: o.subcity || o.officer.subcity,
            requestsTotal: o.requestsTotal,
            requestsProcessed: o.requestsProcessed,
            avgResponseTime: o.averageResponseTimeMs || o.avgResponseTime || 0,
            responseRate: Number((combinedResponseRate * 100)),
            rawScore: raw,
            rankScore: raw,
            score: Number(((raw / (globalMax || 1)) * 100))
        };
    });

    return results;
}
