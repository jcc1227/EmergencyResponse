"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AlertHistory_js_1 = require("../models/AlertHistory.js");
const index_js_1 = require("../models/index.js");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
// Get alert history for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, page = 1, status } = req.query;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };
        if (status && (status === 'resolved' || status === 'cancelled')) {
            query.finalStatus = status;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [history, total] = await Promise.all([
            AlertHistory_js_1.AlertHistory.find(query)
                .sort({ alertCreatedAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            AlertHistory_js_1.AlertHistory.countDocuments(query),
        ]);
        res.json({
            history,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get alert history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get a specific alert history entry
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid history ID' });
        }
        const historyEntry = await AlertHistory_js_1.AlertHistory.findById(id);
        if (!historyEntry) {
            return res.status(404).json({ error: 'Alert history not found' });
        }
        res.json(historyEntry);
    }
    catch (error) {
        console.error('Get alert history entry error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Archive an alert to history (called when alert is resolved or cancelled)
router.post('/archive/:alertId', async (req, res) => {
    try {
        const { alertId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(alertId)) {
            return res.status(400).json({ error: 'Invalid alert ID' });
        }
        const alert = await index_js_1.Alert.findById(alertId);
        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        if (alert.status !== 'resolved' && alert.status !== 'cancelled') {
            return res.status(400).json({
                error: 'Only resolved or cancelled alerts can be archived'
            });
        }
        // Check if already archived
        const existingHistory = await AlertHistory_js_1.AlertHistory.findOne({ originalAlertId: alert._id });
        if (existingHistory) {
            return res.status(409).json({
                error: 'Alert already archived',
                history: existingHistory,
            });
        }
        const historyEntry = new AlertHistory_js_1.AlertHistory({
            originalAlertId: alert._id,
            type: alert.type,
            description: alert.description,
            location: alert.location,
            userId: alert.userId,
            userName: alert.userName,
            userPhone: alert.userPhone,
            emergencyContacts: alert.emergencyContacts,
            priority: alert.priority,
            finalStatus: alert.status,
            responderId: alert.responderId,
            responderName: alert.responderName,
            responseTime: alert.responseTime,
            resolvedTime: alert.resolvedTime,
            alertCreatedAt: alert.createdAt,
            alertUpdatedAt: alert.updatedAt,
            notes: alert.notes,
        });
        await historyEntry.save();
        res.status(201).json({
            message: 'Alert archived to history successfully',
            history: historyEntry,
        });
    }
    catch (error) {
        console.error('Archive alert error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get alert history statistics for a user
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const [totalAlerts, resolvedAlerts, cancelledAlerts, alertsByType] = await Promise.all([
            AlertHistory_js_1.AlertHistory.countDocuments({ userId: userObjectId }),
            AlertHistory_js_1.AlertHistory.countDocuments({ userId: userObjectId, finalStatus: 'resolved' }),
            AlertHistory_js_1.AlertHistory.countDocuments({ userId: userObjectId, finalStatus: 'cancelled' }),
            AlertHistory_js_1.AlertHistory.aggregate([
                { $match: { userId: userObjectId } },
                { $group: { _id: '$type', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);
        res.json({
            totalAlerts,
            resolvedAlerts,
            cancelledAlerts,
            alertsByType: alertsByType.map(item => ({
                type: item._id,
                count: item.count,
            })),
        });
    }
    catch (error) {
        console.error('Get alert history stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete a history entry (admin only - optional)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid history ID' });
        }
        const result = await AlertHistory_js_1.AlertHistory.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ error: 'Alert history not found' });
        }
        res.json({ message: 'Alert history deleted successfully' });
    }
    catch (error) {
        console.error('Delete alert history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
