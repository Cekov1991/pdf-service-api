import express from 'express';
import pdfController from '../controllers/pdfController.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => pdfController.healthCheck(req, res));

// Generic PDF generation from template
router.post('/pdf/generate', (req, res) => pdfController.generatePDF(req, res));

// Specific template endpoints
router.post('/pdf/visit-report', (req, res) => pdfController.generateVisitReport(req, res));

// Generate from raw HTML
router.post('/pdf/from-html', (req, res) => pdfController.generateFromHTML(req, res));

// Generate from URL
router.post('/pdf/from-url', (req, res) => pdfController.generateFromURL(req, res));

export default router;


