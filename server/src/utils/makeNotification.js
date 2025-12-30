import Notification from "../models/Notification.js";

/**
 * Utility to create a notification
 * @param {String} recipient - The User ID
 * @param {String} title - Must match the Enum in your Schema
 * @param {String} message - The notification body
 */
export const makeNotification = async (recipient, title, message) => {
    try {
        const notification = await Notification.create({
            recipient,
            title,
            message
        });
        return notification;

    } catch (error) {
        console.error("Error creating notification:", error.message);
        throw new Error("Notification creation failed");
    }
};