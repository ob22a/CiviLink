import Conversation from '../../models/Conversation.js';
import Application from '../../models/Application.js';
import OfficerStats from '../../models/views/OfficerStats.js';
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

  await Promise.all(
    allStats.map(stat =>
      OfficerStats.findOneAndUpdate(
        { officerId: stat.officerId, period: stat.period },
        { $set: stat },
        { upsert: true, new: true }
      )
    )
  );

  return allStats;
}