import mongoose from "mongoose";
import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 5, unreadOnly } = req.query;

    const myAggregate = Notification.aggregate([
        { 
            $match: { 
                recipient: new mongoose.Types.ObjectId(userId), 
                deletedAt: null,
                ...(unreadOnly === "true" && { read: false })
            } 
        },
        { $sort: { createdAt: -1 } },
        { 
            $project: {
                _id: 0, 
                id: "$_id", 
                title: 1,
                message: 1,
                read: 1,
                createdAt: 1
            }
        }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        customLabels: {
            totalDocs: 'totalNotifications',
            docs: 'notifications'
        }
    };

    try {
        const result = await Notification.aggregatePaginate(myAggregate, options);

        return res.status(200).json({
            success: true,
            data: {
                notifications: result.notifications, 
                total: result.totalNotifications,
                page: result.page,
                totalPages: result.totalPages,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
};

export const markNotificationAsRead = async (req, res) => {
    const { id: notificationId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(400).json({ success: false, error: { message: "Invalid ID format." } });
    }

    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { $set: { read: true } },
            { new: true } 
        ).select("title message read createdAt"); 

        if (!notification) {
            return res.status(404).json({ success: false, error: { message: "Not found." } });
        }

        return res.status(200).json({ success: true, data: notification });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: "Server error." } });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    const userId = req.user.id; 
    try {
        const result = await Notification.updateMany(
            { recipient: userId, read: false, deletedAt: null }, 
            { $set: { read: true } }
        );

        return res.status(200).json({
            success: true,
            data: { modifiedCount: result.modifiedCount }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: "Update failed." } });
    }
};

export const deleteNotification = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: { message: "Invalid ID." } });
    }

    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: userId, deletedAt: null },
            { $set: { deletedAt: new Date() } },
            { new: true }
        ).select("_id"); 

        if (!notification) {
            return res.status(404).json({ success: false, error: { message: "Not found." } });
        }

        return res.status(200).json({
            success: true,
            data: { id: notification._id, message: "Notification deleted." }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: "Server error." } });
    }
};