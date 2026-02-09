import OfficerStats from "../../models/views/OfficerStats.js";
import Officer from "../../models/Officer.js"
import { Types } from "mongoose";

/**
 * Calculates a global maximum raw score to use as a consistent benchmark for normalization.
 */
async function getGlobalMaxScore(pipelineBase = []) {
    // Accept a base pipeline and compute the maximum per-officer rankScore where
    // rankScore = (processedRequests / totalRequests) * ln(totalRequests + 1)
    const pipeline = Array.isArray(pipelineBase) ? [...pipelineBase] : [];

    // Sum exact processed counts and totals per officer if available
    pipeline.push({
        $group: {
            _id: '$officerId',
            sumProcessedFromApps: { $sum: { $ifNull: ['$processedApplications', { $multiply: ['$applicationResponseRate', '$totalApplications'] }] } },
            sumProcessedFromConvs: { $sum: { $ifNull: ['$processedConversations', { $multiply: ['$communicationResponseRate', '$totalConversations'] }] } },
            totalApplications: { $sum: '$totalApplications' },
            totalConversations: { $sum: '$totalConversations' }
        }
    });

    pipeline.push({
        $project: {
            requestsProcessed: { $add: ['$sumProcessedFromApps', '$sumProcessedFromConvs'] },
            totalRequests: { $add: ['$totalApplications', '$totalConversations'] }
        }
    });

    pipeline.push({
        $project: {
            rankScore: {
                $cond: [
                    { $gt: ['$totalRequests', 0] },
                    { $multiply: [{ $divide: ['$requestsProcessed', '$totalRequests'] }, { $ln: { $add: ['$totalRequests', 1] } }] },
                    0
                ]
            }
        }
    });

    pipeline.push({ $group: { _id: null, maxRankScore: { $max: '$rankScore' } } });

    const result = await OfficerStats.aggregate(pipeline);
    const max = result[0]?.maxRankScore;
    return (max && max > 0) ? max : 1;
}

export async function getAggregatedPerformance({ from, to, officerId, department, subcity }) {
    const match = {};
    if (from || to) {
        match.period = {};
        if (from) match.period.$gte = from;
        if (to) match.period.$lte = to;
    }
    if (officerId) match.officerId = new Types.ObjectId(officerId);

    const pipeline = [
        { $match: match },
        {
            $lookup: {
                from: 'users',
                localField: 'officerId',
                foreignField: '_id',
                as: 'officer'
            }
        },
        { $unwind: '$officer' }
    ];

    if (department) pipeline.push({ $match: { 'officer.department': department } });
    if (subcity) pipeline.push({ $match: { 'officer.subcity': subcity } });

    // Compute global max using the same pipeline so normalization is scoped correctly
    const globalMax = await getGlobalMaxScore(pipeline);
    const results = await OfficerStats.aggregate([
        ...pipeline,
        {
            $facet: {
                globalStats: [
                    {
                        $group: {
                            _id: null,
                            totalAssigned: { $sum: { $add: ['$totalConversations', '$totalApplications'] } },
                            sumProcessedComm: { $sum: { $ifNull: ['$processedConversations', { $multiply: ['$communicationResponseRate', '$totalConversations'] }] } },
                            sumProcessedApp: { $sum: { $ifNull: ['$processedApplications', { $multiply: ['$applicationResponseRate', '$totalApplications'] }] } },
                            // For domain rates, we only average documents that have actual activity in that domain (No Ghost Zeros)
                            commDocsCount: { $sum: { $cond: [{ $gt: ['$totalConversations', 0] }, 1, 0] } },
                            appDocsCount: { $sum: { $cond: [{ $gt: ['$totalApplications', 0] }, 1, 0] } },
                            sumCommRates: { $sum: { $cond: [{ $gt: ['$totalConversations', 0] }, '$communicationResponseRate', 0] } },
                            sumAppRates: { $sum: { $cond: [{ $gt: ['$totalApplications', 0] }, '$applicationResponseRate', 0] } },
                            avgResponseTimeMs: { $avg: '$averageResponseTimeMs' }
                        }
                    },
                    {
                        $addFields: {
                            totalRequestsProcessed: { $add: ['$sumProcessedComm', '$sumProcessedApp'] },
                            communicationResponseRate: {
                                $cond: [{ $gt: ['$commDocsCount', 0] }, { $divide: ['$sumCommRates', '$commDocsCount'] }, 0]
                            },
                            applicationResponseRate: {
                                $cond: [{ $gt: ['$appDocsCount', 0] }, { $divide: ['$sumAppRates', '$appDocsCount'] }, 0]
                            }
                        }
                    },
                    {
                        $addFields: {
                            // Org-wide combined rate (Weighted)
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
                            officer: { $first: '$officer' },
                            totalConversations: { $sum: '$totalConversations' },
                            totalApplications: { $sum: '$totalApplications' },
                            // sum processed approximations
                            sumProcessedFromConvs: { $sum: { $ifNull: ['$processedConversations', { $multiply: ['$communicationResponseRate', '$totalConversations'] }] } },
                            sumProcessedFromApps: { $sum: { $ifNull: ['$processedApplications', { $multiply: ['$applicationResponseRate', '$totalApplications'] }] } },
                            avgResponseTimeMs: { $avg: '$averageResponseTimeMs' },
                        }
                    },
                    {
                        $addFields: {
                            requestsProcessed: { $add: ['$sumProcessedFromConvs', '$sumProcessedFromApps'] },
                            requestsTotal: { $add: ['$totalConversations', '$totalApplications'] }
                        }
                    },
                    {
                        $addFields: {
                            rawScore: {
                                $cond: [
                                    { $gt: ['$requestsTotal', 0] },
                                    { $multiply: [{ $divide: ['$requestsProcessed', '$requestsTotal'] }, { $ln: { $add: ['$requestsTotal', 1] } }] },
                                    0
                                ]
                            },
                            // Calculate weighted response rates for each type to avoid average of averages
                            communicationResponseRate: {
                                $cond: [{ $gt: ['$totalConversations', 0] }, { $divide: ['$sumProcessedFromConvs', '$totalConversations'] }, 0]
                            },
                            applicationResponseRate: {
                                $cond: [{ $gt: ['$totalApplications', 0] }, { $divide: ['$sumProcessedFromApps', '$totalApplications'] }, 0]
                            }
                        }
                    },
                    { $sort: { rawScore: -1, requestsTotal: -1 } }
                ],
                monthlyTrend: [
                    {
                        $group: {
                            _id: '$period',
                            totalConversations: { $sum: '$totalConversations' },
                            totalApplications: { $sum: '$totalApplications' },
                            sumProcessedFromConvs: { $sum: { $ifNull: ['$processedConversations', { $multiply: ['$communicationResponseRate', '$totalConversations'] }] } },
                            sumProcessedFromApps: { $sum: { $ifNull: ['$processedApplications', { $multiply: ['$applicationResponseRate', '$totalApplications'] }] } },
                            averageResponseTimeMs: { $avg: '$averageResponseTimeMs' },
                        }
                    },
                    {
                        $addFields: {
                            communicationResponseRate: {
                                $cond: [{ $gt: ['$totalConversations', 0] }, { $divide: ['$sumProcessedFromConvs', '$totalConversations'] }, 0]
                            },
                            applicationResponseRate: {
                                $cond: [{ $gt: ['$totalApplications', 0] }, { $divide: ['$sumProcessedFromApps', '$totalApplications'] }, 0]
                            }
                        }
                    },
                    { $sort: { _id: 1 } },
                    {
                        $project: {
                            month: '$_id',
                            requestsProcessed: { $add: ['$totalConversations', '$totalApplications'] },
                            averageResponseTimeMs: 1,
                            communicationResponseRate: 1,
                            applicationResponseRate: 1,
                            _id: 0
                        }
                    }
                ]
            }
        }
    ]);

    const data = results[0];

    // Apply normalization based on the global distribution and expose rawScore
    if (data.officerPerformance) {
        data.officerPerformance = data.officerPerformance.map(o => {
            const totalConv = o.totalConversations || 0;
            const totalApp = o.totalApplications || 0;
            const denom = totalConv + totalApp;
            const commRate = o.communicationResponseRate || 0;
            const appRate = o.applicationResponseRate || 0;
            const combinedResponseRate = denom > 0 ? (o.requestsProcessed / denom) : 0;
            // preserve full precision for raw and normalized scores (no premature rounding)
            const raw = (o.rawScore || 0);
            const normalizedScore = ((raw / (globalMax || 1)) * 100);
            return {
                ...o,
                rawScore: raw,
                rankScore: raw,
                normalizedScore,
                combinedResponseRate: Number((combinedResponseRate * 100)), // percentage
                combinedAvgResponseTimeMs: Number((o.avgResponseTimeMs || 0))
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
    if (from || to) {
        match.period = {};
        if (from) match.period.$gte = from;
        if (to) match.period.$lte = to;
    }
    // Build the same pipeline used for aggregation so pagination and normalization align
    const pipeline = [
        { $match: match },
        {
            $lookup: {
                from: 'users',
                localField: 'officerId',
                foreignField: '_id',
                as: 'officer'
            }
        },
        { $unwind: '$officer' }
    ];

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        pipeline.push({
            $match: {
                $or: [
                    { 'officer.fullName': searchRegex },
                    { 'officer.email': searchRegex }
                ]
            }
        });
    }

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        pipeline.push({
            $match: {
                $or: [
                    { 'officer.fullName': searchRegex },
                    { 'officer.email': searchRegex }
                ]
            }
        });
    }

    if (department) pipeline.push({ $match: { 'officer.department': department } });
    if (subcity) pipeline.push({ $match: { 'officer.subcity': subcity } });

    const globalMax = await getGlobalMaxScore(pipeline);

    const aggregate = OfficerStats.aggregate(pipeline);

    aggregate.group({
        _id: '$officerId',
        officer: { $first: '$officer' },
        totalRequests: { $sum: { $add: ['$totalConversations', '$totalApplications'] } },
        totalConversations: { $sum: '$totalConversations' },
        totalApplications: { $sum: '$totalApplications' },
        avgResponseTime: { $avg: '$averageResponseTimeMs' },
        communicationResponseRate: { $avg: '$communicationResponseRate' },
        applicationResponseRate: { $avg: '$applicationResponseRate' },
        // compute processed approximations for pagination too
        sumProcessedFromConvs: { $sum: { $ifNull: ['$processedConversations', { $multiply: ['$communicationResponseRate', '$totalConversations'] }] } },
        sumProcessedFromApps: { $sum: { $ifNull: ['$processedApplications', { $multiply: ['$applicationResponseRate', '$totalApplications'] }] } }
    });

    // compute per-officer rawScore used for pagination ordering (exact same formula as main aggregation)
    aggregate.pipeline().push({
        $addFields: {
            requestsProcessed: { $add: ['$sumProcessedFromConvs', '$sumProcessedFromApps'] },
            requestsTotal: { $add: ['$totalConversations', '$totalApplications'] }
        }
    });

    aggregate.pipeline().push({
        $addFields: {
            rawScore: {
                $cond: [
                    { $gt: ['$requestsTotal', 0] },
                    { $multiply: [{ $divide: ['$requestsProcessed', '$requestsTotal'] }, { $ln: { $add: ['$requestsTotal', 1] } }] },
                    0
                ]
            }
        }
    });

    aggregate.sort({ rawScore: -1, requestsTotal: -1 });

    // --- Calculate Global Counts (Total, Active, On Leave) ---
    // We query the Officer model directly to get accurate current system state counts,
    // independent of whether they have performance stats in the selected period.
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

    // Run counts concurrently for performance
    const [totalCount, activeCount, onLeaveCount] = await Promise.all([
        Officer.countDocuments(countQuery),
        Officer.countDocuments({ ...countQuery, onLeave: { $ne: true } }),
        Officer.countDocuments({ ...countQuery, onLeave: true })
    ]);

    const counts = {
        total: totalCount,
        active: activeCount,
        onLeave: onLeaveCount
    };
    // ---------------------------------------------------------

    const options = { page: parseInt(page), limit: parseInt(limit) };
    const results = await OfficerStats.aggregatePaginate(aggregate, options);

    // Attach counts to results
    results.counts = {
        total: counts.total,
        active: counts.active,
        onLeave: counts.onLeave
    };

    results.docs = results.docs.map(o => {
        const totalConv = o.totalConversations || 0;
        const totalApp = o.totalApplications || 0;
        const denom = totalConv + totalApp;
        const commRate = o.communicationResponseRate || 0;
        const appRate = o.applicationResponseRate || 0;
        const combinedResponseRate = denom > 0 ? (o.requestsProcessed / denom) : 0;
        const raw = (o.rawScore || o.computedRawScore || 0);
        return {
            officerId: o._id,
            // Use fullName if available, fall back to first/last or ID snippet
            name: o.officer?.fullName || `${o.officer?.firstName || ''} ${o.officer?.lastName || ''}`.trim() || (o._id ? `(${o._id.toString().slice(-4)})` : 'Unknown'),
            department: o.officer.department,
            subcity: o.officer.subcity,
            requestsTotal: o.requestsTotal,
            requestsProcessed: o.requestsProcessed,
            avgResponseTime: o.avgResponseTime,
            responseRate: Number((combinedResponseRate * 100)),
            rawScore: raw,
            rankScore: raw,
            // score (percentage) remains for UI backward compatibility
            score: Number(((raw / (globalMax || 1)) * 100))
        };
    });

    return results;
}
