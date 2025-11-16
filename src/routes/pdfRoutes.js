import express from 'express';
import pdfController from '../controllers/pdfController.js';
import { validatePayloadSize, validatePDFOptions, validateTemplateSpecs } from '../middlewares/validation.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => pdfController.healthCheck(req, res));

// Generic PDF generation from template
router.post(
  '/pdf/generate',
  validatePayloadSize,
  validateTemplateSpecs,
  validatePDFOptions,
  (req, res) => pdfController.generatePDF(req, res)
);

// Generate from raw HTML
router.post(
  '/pdf/from-html',
  validatePayloadSize,
  validatePDFOptions,
  (req, res) => pdfController.generateFromHTML(req, res)
);

// Generate from URL
router.post(
  '/pdf/from-url',
  validatePayloadSize,
  validatePDFOptions,
  (req, res) => pdfController.generateFromURL(req, res)
);

export default router;


