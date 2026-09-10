const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ── Gzip Compression ─────────────────────────────────────────────────
// Reduces response payload by 60-80% — speeds up all API responses significantly
app.use(compression({ level: 6, threshold: 1024 }));

// CORS - Allow all origins (safe since JWT is used, not cookies)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Lightweight Health Check Endpoint for Connectivity Verification
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: Date.now() });
});

// Request Logger — disabled in production to reduce CPU/IO overhead
// Only enable for debugging — comment this out in production
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

let sharp = null;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp image optimization module not loaded, fallback to static file');
}

const cacheDir = path.join(__dirname, 'uploads', 'cache');
if (!fs.existsSync(cacheDir)) {
  try { fs.mkdirSync(cacheDir, { recursive: true }); } catch (e) {}
}

// Serve uploaded images via high-performance WebP compression & caching
app.get('/api/image', async (req, res) => {
  const filename = req.query.file;
  if (!filename) return res.status(400).json({ message: 'Missing file parameter' });
  
  const safeName = path.basename(filename);
  const filePath = path.join(__dirname, 'uploads', safeName);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Image not found', requested: safeName });
  }

  // Videos or non-images bypass image compression
  const ext = path.extname(safeName).toLowerCase();
  const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic', '.tiff'].includes(ext);

  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  // Support direct file download when ?download=1 is specified
  if (req.query.download === '1' || req.query.download === 'true') {
    const rawBase = safeName.replace(/\.[^/.]+$/, "");
    const dlFilename = req.query.filename ? path.basename(req.query.filename) : `zenivio_${rawBase}.jpg`;
    res.setHeader('Content-Disposition', `attachment; filename="${dlFilename}"`);
  }

  const audioMimes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac'
  };

  if (!isImage || !sharp) {
    if (ext === '.webp') res.setHeader('Content-Type', 'image/webp');
    if (audioMimes[ext]) res.setHeader('Content-Type', audioMimes[ext]);
    return res.sendFile(filePath);
  }

  const reqWidth = parseInt(req.query.w, 10);
  const hasCustomWidth = !isNaN(reqWidth) && reqWidth > 0 && reqWidth <= 2560;

  // If already WebP and no custom width requested, serve directly at full native resolution
  if (ext === '.webp' && !hasCustomWidth) {
    res.setHeader('Content-Type', 'image/webp');
    return res.sendFile(filePath);
  }

  const targetWidth = hasCustomWidth ? reqWidth : 1920;
  const quality = 92;
  const cacheKey = `${safeName}_w${targetWidth}_q${quality}.webp`;
  const cachedFilePath = path.join(cacheDir, cacheKey);

  if (fs.existsSync(cachedFilePath)) {
    res.setHeader('Content-Type', 'image/webp');
    return res.sendFile(cachedFilePath);
  }

  try {
    const pipeline = sharp(filePath).rotate();
    
    if (hasCustomWidth) {
      pipeline.resize({ width: targetWidth, withoutEnlargement: true });
    }

    await pipeline
      .webp({ quality, effort: 6, smartSubsample: true })
      .toFile(cachedFilePath);

    res.setHeader('Content-Type', 'image/webp');
    return res.sendFile(cachedFilePath);
  } catch (err) {
    console.error('Image compression error:', err.message);
    return res.sendFile(filePath);
  }
});

// Database Connection
const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool: allow up to 10 concurrent DB connections
      maxPoolSize: 10,
      // Don't wait more than 5s to find a server
      serverSelectionTimeoutMS: 5000,
      // Socket timeout — drop slow queries after 45s
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Atlas Connected Successfully!');
    
    // Routes
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);

    const profileRoutes = require('./routes/profileRoutes');
    app.use('/api/profile', profileRoutes);

    const transactionRoutes = require('./routes/transactionRoutes');
    app.use('/api/transactions', transactionRoutes);

    const referralRoutes = require('./routes/referralRoutes');
    app.use('/api/referrals', referralRoutes);

    const verificationRoutes = require('./routes/verificationRoutes');
    app.use('/api/verification', verificationRoutes);

    const leaderboardRoutes = require('./routes/leaderboardRoutes');
    app.use('/api/leaderboard', leaderboardRoutes);

    const supportRoutes = require('./routes/supportRoutes');
    app.use('/api/support', supportRoutes);

    const earningRoutes = require('./routes/earningRoutes');
    app.use('/api/earning', earningRoutes);

    const adminRoutes = require('./routes/adminRoutes');
    app.use('/api/admin', adminRoutes);

    const postRoutes = require('./routes/postRoutes');
    app.use('/api/posts', postRoutes);

    const notificationRoutes = require('./routes/notificationRoutes');
    app.use('/api/notifications', notificationRoutes);

    const emailVerifyRoutes = require('./routes/emailVerifyRoutes');
    app.use('/api/email-verify', emailVerifyRoutes);

    const accountVerifyRoutes = require('./routes/accountVerifyRoutes');
    app.use('/api/account-verify', accountVerifyRoutes);

    const messageRoutes = require('./routes/messageRoutes');
    app.use('/api/messages', messageRoutes);

    const zinipayRoutes = require('./routes/zinipayRoutes');
    app.use('/api/payment/zinipay', zinipayRoutes);

    const musicRoutes = require('./routes/musicRoutes');
    app.use('/api/music', musicRoutes);

    const activityRoutes = require('./routes/activityRoutes');
    app.use('/api/activity', activityRoutes);

    // Basic Route
    app.get('/', (req, res) => {
      res.send('Zenivio API is running...');
    });

    // Privacy Policy route for Google Play Store compliance
    // Note: We use /api/privacy-policy so Nginx proxies the request to the Node.js backend
    app.get('/api/privacy-policy', (req, res) => {
      res.sendFile(path.join(__dirname, 'privacy.html'));
    });

    app.get('/privacy-policy', (req, res) => {
      res.sendFile(path.join(__dirname, 'privacy.html'));
    });

    // Debug Route
    app.get('/api/debug/uploads', (req, res) => {
      const fs = require('fs');
      const uploadDir = path.join(__dirname, 'uploads');
      const backendDir = __dirname;
      
      let debugInfo = {
        backendDir,
        uploadDir,
        exists: fs.existsSync(uploadDir),
        files: []
      };

      if (debugInfo.exists) {
        debugInfo.files = fs.readdirSync(uploadDir);
        try {
          const stats = fs.statSync(uploadDir);
          debugInfo.permissions = stats.mode.toString(8);
        } catch (e) {
          debugInfo.error = e.message;
        }
      }
      
      res.json(debugInfo);
    });

    // Global Error Handler
    app.use((err, req, res, next) => {
      console.error('Global Error Handler:', err);
      res.status(500).json({ 
        message: 'Internal Server Error', 
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });

    const PORT = process.env.PORT || 5001;
    
    // Setup HTTP server and Socket.IO
    const http = require('http');
    const server = http.createServer(app);
    const socketIo = require('./socket');
    socketIo.init(server);

    if (isNaN(PORT)) {
      server.listen(PORT, () => {
        console.log(`🚀 Server running on Unix Socket/Pipe: ${PORT}`);
      });
    } else {
      server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT} at http://0.0.0.0:${PORT}`);
      });
    }
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

startServer();
