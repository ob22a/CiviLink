import cron from 'node-cron';
import Officer from '../models/Officer.js';
import { makeNotification } from '../utils/makeNotification.js';

export const assignNewsOfficer = async () => {
    console.log('--- Assigning new news writer ---');
    try {
        const previousWriter = await Officer.findOneAndUpdate(
            { writeNews: true },
            { $set: { writeNews: false } }
        ).select('_id');

        const previousId = previousWriter?._id;
        const candidate = await Officer.findOne({
            onLeave: false,
            _id: { $ne: previousId }
        })
        .sort({ workLoad: 1, updatedAt: 1 });

        if (candidate) {
            candidate.writeNews = true;
            await candidate.save();

            await makeNotification(
                candidate._id,
                "News Assignment",
                "You have been assigned as this week's news writer."
            );

            console.log(`Duty transferred from ${previousId || 'None'} to ${candidate._id}`);
            return candidate;
        }
        return null;
    } catch (error) {
        console.error('Cron Error:', error);
        throw error;
    }
}

const initNewsCron = () => {
    cron.schedule('0 0 * * 0', assignNewsOfficer);
};

export default initNewsCron;
