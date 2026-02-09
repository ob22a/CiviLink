import Conversation from '../../models/Conversation.js';
import Application from '../../models/Application.js';
import OfficerStatsMonthly from '../../models/views/OfficerStatsMonthly.js';
import OfficerStatsCumulative from '../../models/views/OfficerStatsCumulative.js';
import GlobalMaxScore from '../../models/views/GlobalMaxScore.js';
import Officer from '../../models/Officer.js';
import { getMonthRange } from '../../utils/date.js';

export async function calculateOfficerStats(month) {
  const { start, end } = getMonthRange(month);
  // Group conversations by officer and the month of the event (updatedAt)
  const conversationStats = await Conversation.aggregate([
    {
      $match: { // Get conversations that were assigned to an officer and updated within the month
        officerId: { $ne: null },
        updatedAt: { $gte: start, $lte: end }
      }
    },
    {
      $addFields: { // Create a 'period' field in YYYY-MM format for grouping
        period: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } }
      }
    },
    {
      $group: {
        _id: { officerId: '$officerId', period: '$period' },
        assignedCount: { $sum: 1 },
        closedCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'closed'] }, 1, 0]
          }
        },
        totalResponseTimeMs: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'closed'] },
              { $subtract: ['$updatedAt', '$createdAt'] },
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',          // Officer discriminator collection
        localField: '_id.officerId',
        foreignField: '_id',
        as: 'officer'
      }
    },
    { $unwind: '$officer' },
    { $match: { 'officer.department': 'customer_support' } }, // Safety nets to ensure we only include relevant officers but it is kinda redundant
    {
      $addFields: {
        communicationResponseRate: {
          $cond: [
            { $gt: ['$assignedCount', 0] },
            { $divide: ['$closedCount', '$assignedCount'] },
            0
          ]
        },
        averageResponseTimeMs: {
          $cond: [
            { $gt: ['$closedCount', 0] },
            { $divide: ['$totalResponseTimeMs', '$closedCount'] },
            0
          ]
        }
      }
    },
    {
      $addFields: {
        score: {
          $multiply: [
            '$communicationResponseRate',
            { $ln: { $add: ['$assignedCount', 1] } }
          ]
        }
      }
    },
    {
      $project: {
        _id: 0,
        officerId: '$_id.officerId',
        period: '$_id.period',
        department: '$officer.department',
        subcity: '$officer.subcity',
        totalConversations: '$assignedCount',
        totalApplications: { $literal: 0 },
        // exact processed counts for conversations
        processedConversations: '$closedCount',
        communicationResponseRate: 1,
        applicationResponseRate: { $literal: 0 },
        assignedCount: 1,
        averageResponseTimeMs: 1,
        score: 1
      }
    }
  ]);


  // Group applications by assignedOfficer and the month of the event (updatedAt)
  const applicationStats = await Application.aggregate([
    {
      $match: {
        assignedOfficer: { $ne: null },
        updatedAt: { $gte: start, $lte: end }
      }
    },
    {
      $addFields: {
        period: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } }
      }
    },
    {
      $group: {
        _id: { officerId: '$assignedOfficer', period: '$period' },
        assignedCount: { $sum: 1 },
        processedCount: {
          $sum: {
            $cond: [
              { $in: ['$status', ['approved', 'rejected']] },
              1,
              0
            ]
          }
        },
        totalResponseTimeMs: {
          $sum: {
            $cond: [
              { $in: ['$status', ['approved', 'rejected']] },
              { $subtract: ['$updatedAt', '$createdAt'] },
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.officerId',
        foreignField: '_id',
        as: 'officer'
      }
    },
    { $unwind: '$officer' },
    { $match: { 'officer.department': 'approver' } },
    {
      $addFields: {
        applicationResponseRate: {
          $cond: [
            { $gt: ['$assignedCount', 0] },
            { $divide: ['$processedCount', '$assignedCount'] },
            0
          ]
        }
        ,
        averageResponseTimeMs: {
          $cond: [
            { $gt: ['$processedCount', 0] },
            { $divide: ['$totalResponseTimeMs', '$processedCount'] },
            0
          ]
        }
      }
    },
    {
      $addFields: {
        score: {
          $multiply: [
            '$applicationResponseRate',
            { $ln: { $add: ['$assignedCount', 1] } }
          ]
        }
      }
    },
    {
      $project: {
        _id: 0,
        officerId: '$_id.officerId',
        period: '$_id.period',
        department: '$officer.department',
        subcity: '$officer.subcity',
        totalConversations: { $literal: 0 },
        totalApplications: '$assignedCount',
        // exact processed counts for applications
        processedApplications: '$processedCount',
        // Explicitly include application response metrics and set communicationResponseRate to 0
        applicationResponseRate: 1,
        communicationResponseRate: { $literal: 0 },
        averageResponseTimeMs: 1,
        assignedCount: 1,
        score: 1
      }
    }
  ]);

  const allStats = [...conversationStats, ...applicationStats];

  // Map to the new schema format and ensure all fields are computed
  const processedStats = allStats.map(stat => {
    const requestsProcessed = (stat.processedConversations || 0) + (stat.processedApplications || 0);
    const requestsTotal = (stat.totalConversations || 0) + (stat.totalApplications || 0);
    const score = requestsTotal > 0 ? (requestsProcessed / requestsTotal) * Math.log(requestsTotal + 1) : 0;

    return {
      officerId: stat.officerId,
      period: stat.period,
      department: stat.department,
      subcity: stat.subcity,
      totalConversations: stat.totalConversations || 0,
      processedConversations: stat.processedConversations || 0,
      totalApplications: stat.totalApplications || 0,
      processedApplications: stat.processedApplications || 0,
      communicationResponseRate: stat.communicationResponseRate || 0,
      applicationResponseRate: stat.applicationResponseRate || 0,
      averageResponseTimeMs: stat.averageResponseTimeMs || 0,
      requestsProcessed,
      requestsTotal,
      rawScore: score,
      rankScore: score
    };
  });

  // 1. Update OfficerStatsMonthly
  await Promise.all(
    processedStats.map(stat =>
      OfficerStatsMonthly.findOneAndUpdate(
        { officerId: stat.officerId, period: stat.period },
        { $set: stat },
        { upsert: true, new: true }
      )
    )
  );

  // 2. Update OfficerStatsCumulative for involved officers
  const uniqueOfficerIds = [...new Set(processedStats.map(s => s.officerId))];
  await Promise.all(
    uniqueOfficerIds.map(async (officerId) => {
      const officerMonthlyData = await OfficerStatsMonthly.find({ officerId });
      const officer = await Officer.findById(officerId);

      if (!officer) return;

      const cumulative = officerMonthlyData.reduce((acc, curr) => {
        acc.totalConversations += curr.totalConversations;
        acc.processedConversations += curr.processedConversations;
        acc.totalApplications += curr.totalApplications;
        acc.processedApplications += curr.processedApplications;
        acc.requestsProcessed += curr.requestsProcessed;
        acc.requestsTotal += curr.requestsTotal;
        return acc;
      }, {
        totalConversations: 0,
        processedConversations: 0,
        totalApplications: 0,
        processedApplications: 0,
        requestsProcessed: 0,
        requestsTotal: 0
      });

      // Recalculate weighted rates and score for cumulative
      cumulative.communicationResponseRate = cumulative.totalConversations > 0 ? cumulative.processedConversations / cumulative.totalConversations : 0;
      cumulative.applicationResponseRate = cumulative.totalApplications > 0 ? cumulative.processedApplications / cumulative.totalApplications : 0;

      const totalTime = officerMonthlyData.reduce((acc, curr) => {
        const processed = (curr.processedConversations + curr.processedApplications);
        return acc + (curr.averageResponseTimeMs * processed);
      }, 0);
      cumulative.averageResponseTimeMs = cumulative.requestsProcessed > 0 ? totalTime / cumulative.requestsProcessed : 0;

      cumulative.rawScore = cumulative.requestsTotal > 0 ? (cumulative.requestsProcessed / cumulative.requestsTotal) * Math.log(cumulative.requestsTotal + 1) : 0;
      cumulative.rankScore = cumulative.rawScore;

      await OfficerStatsCumulative.findOneAndUpdate(
        { officerId },
        {
          $set: {
            ...cumulative,
            department: officer.department,
            subcity: officer.subcity
          }
        },
        { upsert: true }
      );
    })
  );

  // 3. Update GlobalMaxScore for this period
  const period = processedStats[0]?.period;
  if (period) {
    const maxData = await OfficerStatsMonthly.findOne({ period }).sort({ rankScore: -1 });
    if (maxData) {
      await GlobalMaxScore.findOneAndUpdate(
        { period },
        { $set: { maxRankScore: maxData.rankScore } },
        { upsert: true }
      );
    }
  }

  return processedStats;
}
