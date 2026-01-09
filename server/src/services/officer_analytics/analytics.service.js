import { getCurrentMonth } from '../../utils/date.js';
import { calculateOfficerStats } from '../officer_analytics/officerStatsService.js';
import Conversation from '../../models/Conversation.js';
import Application from '../../models/Application.js';

/**
 * Refreshes officer statistics. By default the job will refresh statistics
 * for months that have activity (from conversations or applications).
 * This prevents overwriting or only having the current month in reports.
 */
export async function refreshAnalytics({ backfillMonths = 12 } = {}) {
  // Find months with activity in both collections (YYYY-MM)
  const convMonths = await Conversation.aggregate([
    { $match: { updatedAt: { $exists: true } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } } } }
  ]);

  const appMonths = await Application.aggregate([
    { $match: { updatedAt: { $exists: true } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } } } }
  ]);

  const monthsSet = new Set();
  convMonths.forEach(m => monthsSet.add(m._id));
  appMonths.forEach(m => monthsSet.add(m._id));

  // If no months found, at least refresh current month
  if (monthsSet.size === 0) {
    const currentMonth = getCurrentMonth();
    await calculateOfficerStats(currentMonth);
    return;
  }

  // Optionally limit to recent months to avoid large runs
  const months = Array.from(monthsSet).sort();
  const recentMonths = months.slice(-Math.max(1, backfillMonths));

  for (const month of recentMonths) {
    await calculateOfficerStats(month);
  }
}
