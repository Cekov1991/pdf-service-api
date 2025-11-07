import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from './routes/pdfRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { validatePayloadSize, validatePDFOptions } from './middlewares/validation.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Compression middleware
app.use(compression());

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Custom validation middleware
app.use(validatePayloadSize);
app.use(validatePDFOptions);

// Routes
app.use('/api', routes);

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PDF Service API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      generate: 'POST /api/pdf/generate',
      visitReport: 'POST /api/pdf/visit-report',
      fromHTML: 'POST /api/pdf/from-html',
      fromURL: 'POST /api/pdf/from-url',
    },
    documentation: 'See README.md for usage instructions',
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PDF Service API running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Base URL: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;


