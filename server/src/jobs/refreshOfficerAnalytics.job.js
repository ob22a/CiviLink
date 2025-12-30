import cron from 'node-cron';
import { refreshAnalytics } from '../services/officer_analytics/analytics.service.js';

export function startAnalyticsJob(){
    cron.schedule('0 */6 * * *', async () => {
    try {
        console.log('[CRON] Refreshing analytics...');
        await refreshAnalytics();
        console.log('[CRON] Analytics refresh completed');
    } catch (err) {
        console.error('[CRON] Analytics refresh failed:', err);
    }
    });
}