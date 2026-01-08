/**
 * Formats a duration in milliseconds to a human-readable string.
 * @param {number} ms - The duration in milliseconds
 * @returns {string} - Formatted duration string (e.g., '12s', '5m', '2h', '3d 4h')
 */
export const formatDuration = (ms) => {
    if (!ms && ms !== 0) return 'N/A';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
};
