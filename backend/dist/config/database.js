"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        // Configure connection options to be more resilient to transient network issues
        await mongoose_1.default.connect(mongoUri, {
            // how long to try selecting a server (ms)
            serverSelectionTimeoutMS: 10000,
            // how long a socket can be idle before timing out (ms)
            socketTimeoutMS: 45000,
            // family: 4 forces IPv4 (helps on some networks)
            family: 4,
            // use TLS when connecting to Atlas (should be inferred from URI)
        });
        console.log('✅ Connected to MongoDB Atlas');
        mongoose_1.default.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('🔁 MongoDB reconnected');
        });
    }
    catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
exports.default = mongoose_1.default;
