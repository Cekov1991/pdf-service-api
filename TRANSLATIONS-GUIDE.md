# Translation System Guide

## Overview

The PDF Service API supports multi-language PDF generation through a locale-based translation system. Translations are automatically loaded based on the `locale` parameter in your request.

## Supported Locales

Currently supported locales:
- **`en`** - English (default)
- **`mk`** - Macedonian (Македонски)

## How It Works

### 1. **Translation Files**

Translation files are stored as JSON in `src/locales/`:

```
src/locales/
├── en.json  # English translations
└── mk.json  # Macedonian translations
```

### 2. **Automatic Label Injection**

When you specify a `locale` in your API request, the system:
1. Loads the corresponding translation file
2. Injects all translations into `data.labels`
3. Your template can access them as `{{labels.key_name}}`

### 3. **Template Usage**

In your HTML templates (e.g., `visit-report.html`), use labels like this:

```html
<h1>{{labels.visit_report}}</h1>
<div class="label">{{labels.full_name}}</div>
<div class="value">{{patient.full_name}}</div>
```

## API Usage

### Method 1: Using `locale` parameter (Recommended)

```json
POST /api/pdf/visit-report
{
  "locale": "mk",
  "data": {
    "patient": {
      "full_name": "Јован Петровски"
    },
    "doctor": {
      "name": "Д-р Сара Јонсон"
    }
  },
  "options": {
    "format": "A4"
  }
}
```

**The system automatically:**
- Loads `mk.json` translations
- Injects them as `data.labels`
- No need to send labels manually

### Method 2: Manual labels (Backward compatible)

```json
POST /api/pdf/visit-report
{
  "data": {
    "labels": {
      "visit_report": "My Custom Title",
      "full_name": "Name"
    },
    "patient": {
      "full_name": "John Doe"
    }
  }
}
```

## Translation Keys Mapping

### Template → Translation Files

Here's how labels in the template map to translation keys:

| Template Usage | Translation Key | EN Value | MK Value |
|----------------|----------------|----------|----------|
| `{{labels.visit_report}}` | `visit_report` | "Visit Report" | "Извештај" |
| `{{labels.patient_information}}` | `patient_information` | "Patient Information" | "Информации за пациентот" |
| `{{labels.full_name}}` | `full_name` | "Full Name" | "Целосно име" |
| `{{labels.dob}}` | `dob` | "Date of Birth" | "Датум на раѓање" |
| `{{labels.doctor}}` | `doctor` | "Doctor" | "Доктор" |
| ... | ... | ... | ... |

**Complete list:** See `src/locales/en.json` or `src/locales/mk.json`

## Examples

### English Visit Report

```bash
curl -X POST http://localhost:3000/api/pdf/visit-report \
  -H "Content-Type: application/json" \
  -d @examples/visit-report-payload-en.json
```

**Payload** (`visit-report-payload-en.json`):
```json
{
  "locale": "en",
  "data": {
    "patient": {
      "full_name": "John Doe"
    },
    "doctor": {
      "name": "Dr. Smith"
    }
  }
}
```

**Result:** PDF with English labels

---

### Macedonian Visit Report

```bash
curl -X POST http://localhost:3000/api/pdf/visit-report \
  -H "Content-Type: application/json" \
  -d @examples/visit-report-payload-mk.json
```

**Payload** (`visit-report-payload-mk.json`):
```json
{
  "locale": "mk",
  "data": {
    "patient": {
      "full_name": "Јован Петровски"
    },
    "doctor": {
      "name": "Д-р Смит"
    }
  }
}
```

**Result:** PDF with Macedonian labels (Македонски)

## Adding New Languages

### Step 1: Create Translation File

Create a new JSON file in `src/locales/` (e.g., `de.json` for German):

```json
{
  "visit_report": "Besuchsbericht",
  "patient_information": "Patienteninformationen",
  "full_name": "Vollständiger Name",
  ...
}
```

### Step 2: Register Locale

Update `src/services/TranslationService.js`:

```javascript
class TranslationService {
  constructor() {
    this.supportedLocales = ['en', 'mk', 'de']; // Add 'de'
    this.defaultLocale = 'en';
  }
}
```

### Step 3: Use New Locale

```json
{
  "locale": "de",
  "data": { ... }
}
```

## Translation Service API

### Methods

The `TranslationService` class provides:

```javascript
// Load translations for a locale
await translationService.getTranslations('mk');

// Get a specific translation
await translationService.translate('mk', 'visit_report');

// Check if locale is supported
translationService.isLocaleSupported('mk'); // true

// Get all supported locales
translationService.getSupportedLocales(); // ['en', 'mk']

// Clear cached translations
translationService.clearCache();
```

## Fallback Behavior

1. **Invalid Locale**: Falls back to default (`en`)
   ```json
   { "locale": "xyz" }  →  Uses "en"
   ```

2. **No Locale**: Uses default (`en`)
   ```json
   { "data": {...} }  →  Uses "en"
   ```

3. **Missing Translation Key**: Returns the key itself
   ```javascript
   labels.unknown_key  →  "unknown_key"
   ```

## Best Practices

### ✅ DO

- Use `locale` parameter for automatic translation loading
- Keep translation keys consistent across all locale files
- Use descriptive key names (e.g., `patient_information` not `pi`)
- Test with multiple locales before deployment

### ❌ DON'T

- Don't hardcode labels in templates
- Don't mix manual labels with locale parameter
- Don't use special characters in translation keys
- Don't forget to add all required keys in new translations

## Available Translation Keys

<details>
<summary>Click to see all 70+ translation keys</summary>

```
generate_pdf
visit_report
generated_on
patient_information
full_name
dob
sex
unique_master_citizen_number
phone
email
visit_information
scheduled_at
type
status
doctor
reason_for_visit
anamnesis
chief_complaint
history_of_present_illness
past_medical_history
family_history
medications_current
allergies
therapy_in_use
other_notes
no_anamnesis_recorded
examination
visus_od
visus_os
iop_od
iop_os
anterior_segment_findings_od
anterior_segment_findings_os
posterior_segment_findings_od
posterior_segment_findings_os
refraction_title
eye
method
sphere
cylinder
axis
add_power
notes
no_examination_recorded
diagnoses
code
term
onset_date
is_primary
yes
no
no_diagnoses_recorded
imaging
modality
imaging_status
findings
no_imaging_recorded
treatments
plan_type
recommendation
details
planned_date
no_treatments_recorded
prescriptions
prescription
medication_name
dosage
frequency
duration
instructions
no_prescriptions_recorded
spectacles
add
prism
pd
no_spectacles_recorded
doctor_signature
date
report_validation
```

</details>

## Testing Translations

### Quick Test - English
```bash
curl -X POST http://localhost:3000/api/pdf/visit-report \
  -H "Content-Type: application/json" \
  -d '{"locale":"en","data":{"patient":{"full_name":"Test"},"doctor":{"name":"Dr. Test"},"generated_at":"07/11/2025","current_date":"07/11/2025"}}'
```

### Quick Test - Macedonian
```bash
curl -X POST http://localhost:3000/api/pdf/visit-report \
  -H "Content-Type: application/json" \
  -d '{"locale":"mk","data":{"patient":{"full_name":"Тест"},"doctor":{"name":"Д-р Тест"},"generated_at":"07/11/2025","current_date":"07/11/2025"}}'
```

## Troubleshooting

### Issue: Labels showing as keys (e.g., "visit_report" instead of "Visit Report")

**Cause:** Translation file not found or locale not specified

**Solution:**
```json
{
  "locale": "en",  ← Add this
  "data": { ... }
}
```

### Issue: Some labels are translated, others aren't

**Cause:** Missing keys in translation file

**Solution:** Check `src/locales/{locale}.json` and add missing keys

### Issue: Unsupported locale error

**Cause:** Locale not registered in `TranslationService`

**Solution:** Add locale to `supportedLocales` array in `TranslationService.js`

---

**Built with 🌍 multi-language support**

