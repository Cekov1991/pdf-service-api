# Payload Format Documentation

## Overview

The PDF Service API uses a flexible and scalable payload format that separates template specifications from data. This allows for better organization of templates into folders and more dynamic template selection.

## Payload Structure

```json
{
  "template_specifications": {
    "folder": "reports",
    "id": "anamnesis",
    "locale": "en"
  },
  "data": {
    // Your labels (translations) embedded directly
    "visit_report": "Visit Report",
    "patient_information": "Patient Information",
    // ... more labels ...
    
    // Your actual data
    "patient": { ... },
    "visit": { ... },
    // ... more data ...
  },
  "options": {
    "format": "A4",
    "landscape": false
  }
}
```

### Template Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `folder` | string | No | Subfolder within `src/templates/` directory. If omitted, templates are loaded from the root templates directory. |
| `id` | string/number | Yes | Template identifier (filename without `.html` extension). |
| `locale` | string | No | Language/locale code (e.g., "en", "mk"). If provided without embedded labels, will load translations from `src/locales/{locale}.json` |

### Data Object

The `data` object contains all information needed to render the template:
- **Embedded Labels**: You can include translation strings directly in the data object
- **Actual Data**: Include all the data needed for your template (patient info, visit details, etc.)

**Note**: If labels are embedded in the data object, they take precedence over locale-based translations. If locale is specified but no labels are embedded, the service will automatically load translations from the locale files.

### Options Object

Standard PDF generation options:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `format` | string | "A4" | Page format: A4, Letter, Legal, A3, A5, Tabloid |
| `landscape` | boolean | false | Page orientation |
| `margin` | object | `{top: '10mm', right: '10mm', bottom: '10mm', left: '10mm'}` | Page margins |
| `displayHeaderFooter` | boolean | false | Show header/footer |
| `headerTemplate` | string | "" | HTML template for header |
| `footerTemplate` | string | "" | HTML template for footer |

## Template Organization

Templates are organized in a folder structure:

```
src/templates/
├── visit-report.html       # Root level template
├── reports/
│   └── anamnesis.html     # Template in "reports" folder
└── invoices/
    └── standard.html      # Template in "invoices" folder
```

### Accessing Templates

**Root level template:**
```json
{
  "template_specifications": {
    "id": "visit-report"
  },
  "data": { ... }
}
```

**Template in subfolder:**
```json
{
  "template_specifications": {
    "folder": "reports",
    "id": "anamnesis"
  },
  "data": { ... }
}
```


## API Endpoints

### POST `/api/pdf/generate`

Generic endpoint for generating PDFs from any template.

**Example:**
```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d @examples/visit-report-payload-new-format.json
```

### POST `/api/pdf/visit-report`

Specialized endpoint for visit reports.

**Example:**
```bash
curl -X POST http://localhost:3000/api/pdf/visit-report \
  -H "Content-Type: application/json" \
  -d @examples/visit-report-payload-new-format.json
```

## Benefits

1. **Better Organization**: Templates can be organized into logical folders
2. **Flexibility**: Embed translations in payload or use locale files
3. **Dynamic Templates**: Template selection based on ID allows for versioning
4. **Self-Contained**: Payloads can be completely self-contained with all translations
5. **Scalability**: Easy to add new template categories without code changes

## Usage Examples

### Basic Usage (Root Template)
```json
{
  "template_specifications": {
    "id": "visit-report",
    "locale": "en"
  },
  "data": {
    "patient": { ... }
  }
}
```

### With Subfolder
```json
{
  "template_specifications": {
    "folder": "reports",
    "id": "anamnesis",
    "locale": "en"
  },
  "data": {
    "patient": { ... }
  }
}
```

### With Embedded Labels (No Locale Files Needed)
```json
{
  "template_specifications": {
    "folder": "reports",
    "id": "anamnesis"
  },
  "data": {
    "visit_report": "Visit Report",
    "patient_information": "Patient Information",
    "patient": { ... }
  }
}
```

## Examples

See the `examples/` directory for complete payload examples:
- `visit-report-payload-new-format.json` - Complete example with embedded labels
- `visit-report-payload.json` - Example with all medical fields
- `visit-report-payload-en.json` - English locale example
- `visit-report-payload-mk.json` - Macedonian locale example

