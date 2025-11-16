import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {
  constructor() {
    this.browser = null;
    this.templatesPath = path.join(__dirname, '..', 'templates');
    this.registerHandlebarsHelpers();
  }

  /**
   * Initialize Puppeteer browser instance
   * Reuses the same browser for better performance
   */
  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: process.env.PDF_HEADLESS !== 'false',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  /**
   * Close browser instance
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Register custom Handlebars helpers
   */
  registerHandlebarsHelpers() {
    // Helper for date formatting
    Handlebars.registerHelper('formatDate', function (date, format) {
      if (!date) return '—';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '—';
      
      // Simple date formatting (you can enhance this)
      if (format === 'd/m/Y H:i') {
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${d.getFullYear()} ${d.getHours()
          .toString()
          .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      }
      if (format === 'd/m/Y') {
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${d.getFullYear()}`;
      }
      return d.toISOString();
    });

    // Helper for conditional rendering
    Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    });

    // Helper for checking if value exists
    Handlebars.registerHelper('ifExists', function (value, options) {
      return value ? options.fn(this) : options.inverse(this);
    });

    // Helper for default value
    Handlebars.registerHelper('default', function (value, defaultValue) {
      return value || defaultValue;
    });
  }

  /**
   * Load and compile a template
   * @param {string} templateName - Name of the template file (without .html)
   * @param {string} folder - Optional folder within templates directory
   * @returns {Function} Compiled Handlebars template
   */
  async loadTemplate(templateName, folder = null) {
    let templatePath;
    if (folder) {
      templatePath = path.join(this.templatesPath, folder, `${templateName}.html`);
    } else {
      templatePath = path.join(this.templatesPath, `${templateName}.html`);
    }
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
  }

  /**
   * Generate PDF from template
   * @param {string} templateName - Name of the template to use
   * @param {Object} data - Data to populate the template
   * @param {Object} options - PDF generation options
   * @returns {Object} PDF result with base64 and metadata
   */
  async generateFromTemplate(templateName, data, options = {}) {
    try {
      // Load and compile template
      const template = await loadTemplate(templateName);
      const html = template(data);

      // Generate PDF from HTML
      return await this.generateFromHTML(html, options);
    } catch (error) {
      throw new Error(`Failed to generate PDF from template: ${error.message}`);
    }
  }

  /**
   * Generate PDF from HTML string
   * @param {string} html - HTML content
   * @param {Object} options - PDF generation options
   * @returns {Object} PDF result with base64 and metadata
   */
  async generateFromHTML(html, options = {}) {
    const page = await this.createPage();

    try {
      // Set default PDF options
      const pdfOptions = {
        format: options.format || 'A4',
        printBackground: true,
        margin: options.margin || {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate || '',
        footerTemplate: options.footerTemplate || '',
        preferCSSPageSize: options.preferCSSPageSize || false,
        landscape: options.landscape || false,
      };

      // Set content and wait for it to load
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: parseInt(process.env.PDF_TIMEOUT || '30000'),
      });

      // Generate PDF buffer
      const pdfBuffer = await page.pdf(pdfOptions);

      // Convert to base64
      const base64 = pdfBuffer.toString('base64');

      return {
        success: true,
        data: {
          base64: base64,
          mimeType: 'application/pdf',
          size: pdfBuffer.length,
          format: pdfOptions.format,
        },
      };
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  /**
   * Generate PDF from URL
   * @param {string} url - URL to convert to PDF
   * @param {Object} options - PDF generation options
   * @returns {Object} PDF result with base64 and metadata
   */
  async generateFromURL(url, options = {}) {
    const page = await this.createPage();

    try {
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: parseInt(process.env.PDF_TIMEOUT || '30000'),
      });

      const pdfOptions = {
        format: options.format || 'A4',
        printBackground: true,
        margin: options.margin || {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
      };

      const pdfBuffer = await page.pdf(pdfOptions);
      const base64 = pdfBuffer.toString('base64');

      return {
        success: true,
        data: {
          base64: base64,
          mimeType: 'application/pdf',
          size: pdfBuffer.length,
          format: pdfOptions.format,
        },
      };
    } catch (error) {
      throw new Error(`Failed to generate PDF from URL: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  /**
   * Create a new page in the browser
   * @returns {Page} Puppeteer page instance
   */
  async createPage() {
    await this.initBrowser();
    return await this.browser.newPage();
  }
}

// Helper function to load template (can be used outside class)
export async function loadTemplate(templateName, folder = null) {
  const templatesPath = path.join(path.dirname(__filename), '..', 'templates');
  let templatePath;
  if (folder) {
    templatePath = path.join(templatesPath, folder, `${templateName}.html`);
  } else {
    templatePath = path.join(templatesPath, `${templateName}.html`);
  }
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  return Handlebars.compile(templateContent);
}

export default PDFService;


