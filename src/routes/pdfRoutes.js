import express from 'express';
import pdfController from '../controllers/pdfController.js';
import { validatePayloadSize, validatePDFOptions, validateTemplateSpecs } from '../middlewares/validation.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => pdfController.healthCheck(req, res));

// Generate PDF from template
router.post(
  '/pdf/generate',
  validatePayloadSize,
  validateTemplateSpecs,
  validatePDFOptions,
  (req, res) => pdfController.generatePDF(req, res)
);

export default router;


