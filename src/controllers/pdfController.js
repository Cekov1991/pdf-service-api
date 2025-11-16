import PDFService, { loadTemplate } from '../services/PDFService.js';
import TranslationService from '../services/TranslationService.js';

class PDFController {
  constructor() {
    this.pdfService = new PDFService();
    this.translationService = new TranslationService();
    this.setupCleanup();
  }

  /**
   * Generate PDF from a specific template
   * POST /api/pdf/generate
   * 
   * Payload format:
   * { template_specifications: { folder, id, locale }, data: {...}, options: {...} }
   */
  async generatePDF(req, res) {
    try {
      const { template_specifications, data, options } = req.body;

      // Validation
      if (!template_specifications) {
        return res.status(400).json({
          success: false,
          error: 'template_specifications is required',
        });
      }

      if (!data) {
        return res.status(400).json({
          success: false,
          error: 'Data is required',
        });
      }

      const { id, folder, locale } = template_specifications;

      // Load translations if locale is provided and labels don't exist in data
      // This allows embedded labels in payload to take precedence
      if (locale && !data.labels) {
        const translations = await this.translationService.getTranslations(locale);
        data.labels = translations;
      }

      // Load and compile template
      const compiledTemplate = await loadTemplate(id, folder);
      const html = compiledTemplate(data);

      // Generate PDF
      const result = await this.pdfService.generateFromHTML(html, options || {});

      res.json(result);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate PDF',
      });
    }
  }

  /**
   * Generate visit report PDF
   * POST /api/pdf/visit-report
   * 
   * Payload format:
   * { template_specifications: { folder, id, locale }, data: {...}, options: {...} }
   */
  async generateVisitReport(req, res) {
    try {
      const { template_specifications, data, options } = req.body;

      if (!template_specifications) {
        return res.status(400).json({
          success: false,
          error: 'template_specifications is required',
        });
      }

      if (!data) {
        return res.status(400).json({
          success: false,
          error: 'Data is required',
        });
      }

      const { id, folder, locale } = template_specifications;

      // Load translations if locale is provided and labels don't exist in data
      // This allows embedded labels in payload to take precedence
      const selectedLocale = locale || 'en';
      if (!data.labels) {
        const translations = await this.translationService.getTranslations(selectedLocale);
        data.labels = translations;
      }

      // Load and compile template
      const compiledTemplate = await loadTemplate(id, folder);
      const html = compiledTemplate(data);

      // Generate PDF
      const result = await this.pdfService.generateFromHTML(html, options || {});

      res.json(result);
    } catch (error) {
      console.error('Error generating visit report:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate visit report',
      });
    }
  }

  /**
   * Generate PDF from raw HTML
   * POST /api/pdf/from-html
   */
  async generateFromHTML(req, res) {
    try {
      const { html, options } = req.body;

      if (!html) {
        return res.status(400).json({
          success: false,
          error: 'HTML content is required',
        });
      }

      const result = await this.pdfService.generateFromHTML(html, options || {});

      res.json(result);
    } catch (error) {
      console.error('Error generating PDF from HTML:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate PDF from HTML',
      });
    }
  }

  /**
   * Generate PDF from URL
   * POST /api/pdf/from-url
   */
  async generateFromURL(req, res) {
    try {
      const { url, options } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL is required',
        });
      }

      const result = await this.pdfService.generateFromURL(url, options || {});

      res.json(result);
    } catch (error) {
      console.error('Error generating PDF from URL:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate PDF from URL',
      });
    }
  }

  /**
   * Health check endpoint
   * GET /api/health
   */
  async healthCheck(req, res) {
    res.json({
      success: true,
      message: 'PDF Service API is running',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Setup cleanup handlers for graceful shutdown
   */
  setupCleanup() {
    // Cleanup browser on process exit
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, closing browser...');
      await this.pdfService.closeBrowser();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, closing browser...');
      await this.pdfService.closeBrowser();
      process.exit(0);
    });
  }

  /**
   * Get the PDF service instance
   */
  getService() {
    return this.pdfService;
  }
}

// Export a single instance of the controller
export default new PDFController();


