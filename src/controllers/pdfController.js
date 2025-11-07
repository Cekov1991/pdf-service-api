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
   */
  async generatePDF(req, res) {
    try {
      const { template, data, options, locale } = req.body;

      // Validation
      if (!template) {
        return res.status(400).json({
          success: false,
          error: 'Template name is required',
        });
      }

      if (!data) {
        return res.status(400).json({
          success: false,
          error: 'Data is required',
        });
      }

      // Load translations if locale is provided
      if (locale) {
        const translations = await this.translationService.getTranslations(locale);
        data.labels = translations;
      }

      // Load and compile template
      const compiledTemplate = await loadTemplate(template);
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
   */
  async generateVisitReport(req, res) {
    try {
      const { data, options, locale } = req.body;

      if (!data) {
        return res.status(400).json({
          success: false,
          error: 'Data is required',
        });
      }

      // Load translations based on locale (default to 'en')
      const selectedLocale = locale || 'en';
      const translations = await this.translationService.getTranslations(selectedLocale);
      
      // Inject translations into data
      data.labels = translations;

      // Load and compile template
      const compiledTemplate = await loadTemplate('visit-report');
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


