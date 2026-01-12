"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertHistory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const alertHistorySchema = new mongoose_1.Schema({
    originalAlertId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['medical', 'fire', 'police', 'rescue', 'crime', 'accident', 'natural', 'SOS', 'other'],
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String, default: 'Location not specified' },
        accuracy: { type: Number },
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userPhone: {
        type: String,
        required: true,
    },
    emergencyContacts: [{
            name: { type: String },
            phone: { type: String },
            relationship: { type: String },
        }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
    },
    finalStatus: {
        type: String,
        enum: ['resolved', 'cancelled'],
        required: true,
    },
    responderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Responder',
    },
    responderName: String,
    responseTime: Date,
    resolvedTime: Date,
    alertCreatedAt: {
        type: Date,
        required: true,
    },
    alertUpdatedAt: {
        type: Date,
        required: true,
    },
    notes: String,
}, {
    timestamps: true,
    collection: 'alerthistory', // Explicitly set collection name
});
// Indexes for efficient queries
alertHistorySchema.index({ userId: 1, createdAt: -1 });
alertHistorySchema.index({ finalStatus: 1 });
alertHistorySchema.index({ alertCreatedAt: -1 });
exports.AlertHistory = mongoose_1.default.model('AlertHistory', alertHistorySchema);
