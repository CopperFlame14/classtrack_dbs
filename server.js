const express = require('express');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');
const fs = require('fs');
const { initDB } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure QR codes directory exists
const qrDir = path.join(__dirname, 'qr-codes');
if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir);
}

// API Routes
app.use('/api/classrooms', require('./routes/classrooms'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/timeslots', require('./routes/timetable'));
app.use('/api/auth', require('./routes/auth'));
// New module routes
app.use('/api/blocks', require('./routes/blocks'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/amenities', require('./routes/amenities'));

// Helper to get base URL dynamically
function getBaseUrl(req) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
    return `${protocol}://${host}`;
}

// QR Code generation endpoint
app.get('/api/qr/:roomId', async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const baseUrl = getBaseUrl(req);
        const roomUrl = `${baseUrl}/room.html?id=${roomId}`;

        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(roomUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#1e293b',
                light: '#ffffff'
            }
        });

        res.json({
            roomId,
            roomUrl,
            qrCode: qrDataUrl
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download QR code as image
app.get('/api/qr/:roomId/download', async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const baseUrl = getBaseUrl(req);
        const roomUrl = `${baseUrl}/room.html?id=${roomId}`;

        const qrBuffer = await QRCode.toBuffer(roomUrl, {
            width: 400,
            margin: 2
        });

        res.set({
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename="qr-${roomId}.png"`
        });
        res.send(qrBuffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/room', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Initialize database and start server
async function startServer() {
    try {
        await initDB();
        console.log('📦 Database initialized');

        // Auto-seed if database is empty (e.g. first deploy on Render)
        const { prepare } = require('./database/db');
        const blockCount = prepare('SELECT COUNT(*) as count FROM blocks').get();
        if (!blockCount || blockCount.count === 0) {
            console.log('🌱 Empty database detected – running auto-seed...');
            const { seed } = require('./database/seed');
            await seed();
        }

        // Initialize scheduler
        const { initScheduler } = require('./services/scheduler');
        initScheduler();

        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║       🏫 Classroom Availability Tracker Running! 🏫       ║
╠═══════════════════════════════════════════════════════════╣
║  Dashboard:  http://localhost:${PORT}                        ║
║  Admin:      http://localhost:${PORT}/admin                  ║
║  API:        http://localhost:${PORT}/api/classrooms         ║
╚═══════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
