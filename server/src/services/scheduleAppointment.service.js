import AppointmentCounter from "../models/AppointmentCounter.js";
import { formatDate, getNextWorkingDay } from "../utils/date.js";

const MAX_PER_SLOT = 20;
const SEARCH_LIMIT_DAYS = 30;

const SLOTS = [
  { key: "Morning", timeRange: "09:00 – 12:00" },
  { key: "Afternoon", timeRange: "14:00 – 17:00" },
];

export const scheduleAppointment = async (officerId) => {
  if (!officerId) {
    throw new Error("officerId is required for appointment scheduling");
  };

  let date = getNextWorkingDay();
  let attempts = 0;

  while (attempts < SEARCH_LIMIT_DAYS) {
    const dateKey = formatDate(date);

    for (const slot of SLOTS) {
      try {
        const counter = await AppointmentCounter.findOneAndUpdate(
          {
            officerId,
            date: dateKey,
            slot: slot.key,
            count: { $lt: MAX_PER_SLOT },
          },
          {
            $inc: { count: 1 },
            $setOnInsert: {
              officerId,
              date: dateKey,
              slot: slot.key,
            },
          },
          {
            new: true,
            upsert: true,
          }
        );

        if (counter) {
          return {
            date: dateKey,
            slot: slot.key,
            timeRange: slot.timeRange,
          };
        }
      } catch (err) {
        if (err.code === 11000) {
          // Another request won the race → try again
          continue;
        }
        throw err;
      }
    }

    // Both slots full → next working day
    date = getNextWorkingDay(date);
    attempts++;
  }

  throw new Error("No available appointment slots for this officer in the next 30 days");
};
