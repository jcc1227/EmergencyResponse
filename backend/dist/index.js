"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const database_js_1 = require("./config/database.js");
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const alerts_js_1 = __importDefault(require("./routes/alerts.js"));
const contacts_js_1 = __importDefault(require("./routes/contacts.js"));
const alertHistory_js_1 = __importDefault(require("./routes/alertHistory.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 5000;
// Socket.io setup for real-time updates
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*', // Allow all origins for development
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true,
    }
});
// Make io accessible to routes
app.set('io', io);
// Middleware
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for development
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_js_1.default);
app.use('/api/alerts', alerts_js_1.default);
app.use('/api/contacts', contacts_js_1.default);
app.use('/api/alert-history', alertHistory_js_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'MongoDB Atlas',
    });
});
// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    // Join room based on user type
    socket.on('join', (data) => {
        socket.join(data.type);
        socket.join(data.id);
        console.log(`📡 ${data.type} ${data.id} joined`);
    });
    // Responder location update
    socket.on('responderLocation', (data) => {
        io.to('user').emit('responderLocationUpdate', data);
    });
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});
// Connect to database and start server
const startServer = async () => {
    await (0, database_js_1.connectDatabase)();
    httpServer.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`🔌 WebSocket server ready`);
        console.log(`\n📱 API endpoints:`);
        console.log(`   POST /api/auth/register/user`);
        console.log(`   POST /api/auth/register/responder`);
        console.log(`   POST /api/auth/login/user`);
        console.log(`   POST /api/auth/login/responder`);
        console.log(`   POST /api/alerts`);
        console.log(`   GET  /api/alerts`);
        console.log(`   GET  /api/alerts/stats/summary`);
        console.log(`   PATCH /api/alerts/:id/status`);
        console.log(`   PATCH /api/alerts/:id/location (GPS update)`);
        console.log(`   GET  /api/contacts/:userId`);
        console.log(`   POST /api/contacts/:userId`);
    });
};
startServer();
