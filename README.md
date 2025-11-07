# PDF Service API

A professional PDF generation service built with Node.js, Express, and Puppeteer. Generate beautiful PDFs from HTML templates with ease.

## Features

- 🎨 **Template-based PDF Generation** - Use Handlebars templates for dynamic content
- 🚀 **High Performance** - Reuses browser instances for optimal performance
- 📄 **Multiple Input Methods** - Generate from templates, raw HTML, or URLs
- 🔒 **Secure** - Built-in rate limiting, CORS, and security headers
- 📦 **Base64 Output** - Returns PDFs as base64 strings (easily extensible to other formats)
- 🎯 **Easy to Extend** - Clean architecture for adding new templates
- 🏥 **Medical Document Ready** - Includes comprehensive visit report template

## Prerequisites

- Node.js 18.x or higher
- npm or yarn

## Installation

1. **Clone or navigate to the project directory:**
```bash
cd pdf-service-api
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Copy `.env.example` to `.env` and adjust settings as needed:
```bash
cp .env.example .env
```

Default `.env` contents:
```env
PORT=3000
NODE_ENV=development
PDF_TIMEOUT=30000
PDF_HEADLESS=true
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Usage

### Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### 1. Health Check
```
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "PDF Service API is running",
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

---

### 2. Generate Visit Report PDF
```
POST /api/pdf/visit-report
```

**Request Body:**
```json
{
  "data": {
    "labels": { ... },
    "patient": { ... },
    "visit": { ... },
    "doctor": { ... },
    "anamnesis": { ... },
    "ophthalmic_exam": { ... },
    "diagnoses": [ ... ],
    "imaging_studies": [ ... ],
    "treatment_plans": [ ... ],
    "prescriptions": [ ... ],
    "spectacle_prescriptions": [ ... ]
  },
  "options": {
    "format": "A4",
    "landscape": false
  }
}
```

See `examples/visit-report-payload.json` for a complete example.

**Response:**
```json
{
  "success": true,
  "data": {
    "base64": "JVBERi0xLjcKCjEgMCBvYmo...",
    "mimeType": "application/pdf",
    "size": 245678,
    "format": "A4"
  }
}
```

---

### 3. Generic Template Generation
```
POST /api/pdf/generate
```

**Request Body:**
```json
{
  "template": "visit-report",
  "data": { ... },
  "options": {
    "format": "A4",
    "landscape": false,
    "margin": {
      "top": "10mm",
      "right": "10mm",
      "bottom": "10mm",
      "left": "10mm"
    }
  }
}
```

---

### 4. Generate from Raw HTML
```
POST /api/pdf/from-html
```

**Request Body:**
```json
{
  "html": "<!DOCTYPE html><html>...",
  "options": {
    "format": "A4"
  }
}
```

---

### 5. Generate from URL
```
POST /api/pdf/from-url
```

**Request Body:**
```json
{
  "url": "https://example.com/page",
  "options": {
    "format": "A4"
  }
}
```

---

## PDF Options

All endpoints support the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | string | `"A4"` | Page format: `A4`, `Letter`, `Legal`, `A3`, `A5`, `Tabloid` |
| `landscape` | boolean | `false` | Page orientation |
| `margin` | object | See below | Page margins |
| `displayHeaderFooter` | boolean | `false` | Display header/footer |
| `headerTemplate` | string | `""` | HTML for header |
| `footerTemplate` | string | `""` | HTML for footer |

**Default margins:**
```json
{
  "top": "10mm",
  "right": "10mm",
  "bottom": "10mm",
  "left": "10mm"
}
```

## Testing with cURL

### Test Visit Report Generation:
```bash
curl -X POST http://localhost:3000/api/pdf/visit-report \
  -H "Content-Type: application/json" \
  -d @examples/visit-report-payload.json
```

### Decode Base64 to PDF (macOS/Linux):
```bash
curl -X POST http://localhost:3000/api/pdf/visit-report \
  -H "Content-Type: application/json" \
  -d @examples/visit-report-payload.json \
  | jq -r '.data.base64' \
  | base64 -d > output.pdf
```

## Adding New Templates

1. **Create template file:**
   Place your Handlebars template in `src/templates/your-template.html`

2. **Add route (optional):**
   For convenience, add a specific route in `src/routes/pdfRoutes.js`:
   ```javascript
   router.post('/pdf/your-template', async (req, res) => {
     // Similar to generateVisitReport
   });
   ```

3. **Use generic endpoint:**
   Or simply use the generic endpoint:
   ```bash
   POST /api/pdf/generate
   {
     "template": "your-template",
     "data": { ... }
   }
   ```

## Handlebars Template Guide

### Available Helpers

**Date Formatting:**
```handlebars
{{formatDate date 'd/m/Y'}}
{{formatDate datetime 'd/m/Y H:i'}}
```

**Conditionals:**
```handlebars
{{#if value}}...{{/if}}
{{#ifEquals var1 var2}}...{{/ifEquals}}
{{#ifExists value}}...{{/ifExists}}
```

**Default Values:**
```handlebars
{{default value "—"}}
```

**Loops:**
```handlebars
{{#each items}}
  {{this.property}}
{{/each}}
```

## Project Structure

```
pdf-service-api/
├── src/
│   ├── services/
│   │   └── PDFService.js          # Core PDF generation logic
│   ├── templates/
│   │   └── visit-report.html      # Handlebars templates
│   ├── controllers/
│   │   └── pdfController.js       # Request handlers
│   ├── routes/
│   │   └── pdfRoutes.js           # API routes
│   ├── middlewares/
│   │   ├── errorHandler.js        # Error handling
│   │   └── validation.js          # Input validation
│   └── server.js                  # Express app setup
├── examples/
│   └── visit-report-payload.json  # Example payloads
├── package.json
├── .env
├── .env.example
└── README.md
```

## Architecture

### PDFService Class

The `PDFService` class provides the core functionality:

```javascript
class PDFService {
  async generateFromTemplate(templateName, data, options)
  async generateFromHTML(html, options)
  async generateFromURL(url, options)
}
```

**Key Features:**
- Reuses Puppeteer browser instance for performance
- Automatic browser cleanup on shutdown
- Custom Handlebars helpers registration
- Flexible PDF options

## Performance Considerations

- **Browser Reuse:** The service maintains a single Puppeteer browser instance across requests
- **Rate Limiting:** Default 100 requests per 15 minutes per IP
- **Payload Limit:** Maximum 10MB request size
- **Timeout:** 30 seconds default PDF generation timeout

## Security Features

- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Request size validation
- ✅ Input validation for PDF options

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Route not found
- `413` - Payload too large
- `429` - Rate limit exceeded
- `500` - Internal server error

## Future Enhancements

This service is designed to be easily extended with:

- [ ] Direct file download endpoints
- [ ] Temporary URL generation for PDFs
- [ ] PDF storage (local/S3)
- [ ] Authentication/API keys
- [ ] PDF manipulation (merge, watermark)
- [ ] WebSocket support for long-running generations
- [ ] Queue system for high load
- [ ] TypeScript migration
- [ ] Docker containerization

## Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure appropriate `CORS_ORIGIN`
3. Adjust rate limits for your use case
4. Set `PDF_HEADLESS=true`
5. Configure proper logging
6. Set up process manager (PM2, systemd)

### Example PM2 Setup

```bash
npm install -g pm2
pm2 start src/server.js --name pdf-service
pm2 save
pm2 startup
```

## Troubleshooting

### Puppeteer Installation Issues

If Puppeteer fails to install:
```bash
npm install puppeteer --unsafe-perm=true
```

### Memory Issues

Increase Node.js memory:
```bash
node --max-old-space-size=4096 src/server.js
```

### Font Issues in PDFs

Install additional fonts (Linux):
```bash
sudo apt-get install fonts-liberation fonts-noto
```

## License

MIT

## Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using Node.js, Express, Puppeteer, and Handlebars**


