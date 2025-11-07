# Postman Setup Guide

## 📥 Import Collection & Environment

### Step 1: Import the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select `postman-collection.json`
4. Click **Import**

### Step 2: Import the Environment

1. Click **Import** again
2. Select `postman-environment.json`
3. Click **Import**
4. Select **"PDF Service - Local"** from the environment dropdown (top right)

## 📋 Available Requests

The collection includes **8 pre-configured requests**:

### 1. **Health Check** (GET)
- Quick test to verify the API is running
- No body required

### 2. **Generate Visit Report PDF** (POST)
- Full medical visit report with all data
- Complete example with patient, exam, diagnoses, prescriptions, etc.

### 3. **Generate PDF from Template (Generic)** (POST)
- Use any template by name
- More flexible for future templates

### 4. **Generate PDF from HTML** (POST)
- Pass raw HTML string
- Good for custom one-off PDFs

### 5. **Generate PDF from URL** (POST)
- Convert any webpage to PDF
- Example: `https://www.example.com`

### 6. **Generate Visit Report - Minimal Data** (POST)
- Test with minimal required fields
- Shows empty state messages

### 7. **Generate PDF - Letter Format** (POST)
- Test US Letter format instead of A4

### 8. **Generate PDF - Landscape** (POST)
- Test landscape orientation

## 🎯 Quick Start

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Test Health Check:**
   - Select "Health Check" request
   - Click **Send**
   - Should return: `{ "success": true, "message": "PDF Service API is running" }`

3. **Generate Your First PDF:**
   - Select "Generate Visit Report PDF"
   - Click **Send**
   - You'll receive a JSON response with `base64` PDF data

## 💾 Save PDF from Response

### Option 1: Using Postman Test Script

Add this to the **Tests** tab of any PDF generation request:

```javascript
// Parse response
const response = pm.response.json();

if (response.success && response.data.base64) {
    // Save base64 to environment for later use
    pm.environment.set("last_pdf_base64", response.data.base64);
    console.log("PDF generated successfully!");
    console.log("Size:", response.data.size, "bytes");
    console.log("Format:", response.data.format);
}
```

### Option 2: Decode Base64 Manually

1. Copy the `base64` string from response
2. Use online tool: https://base64.guru/converter/decode/pdf
3. Or use terminal:
   ```bash
   echo "BASE64_STRING_HERE" | base64 -d > output.pdf
   ```

### Option 3: Using cURL (Recommended)

```bash
# Save complete payload to examples/visit-report-payload.json
curl -X POST http://localhost:3000/api/pdf/visit-report \
  -H "Content-Type: application/json" \
  -d @examples/visit-report-payload.json \
  | jq -r '.data.base64' \
  | base64 -d > visit-report.pdf
```

## 🔧 Customizing Requests

### Change PDF Format

In the request body, modify the `options`:

```json
"options": {
  "format": "Letter",  // A4, Letter, Legal, A3, A5, Tabloid
  "landscape": false
}
```

### Change Base URL

If your API is running on a different port or server:

1. Go to **Environments** (left sidebar)
2. Select **PDF Service - Local**
3. Change `base_url` value
4. Save

## 📊 Understanding the Response

### Success Response:
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

### Error Response:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🎨 Creating Custom Requests

To test with your own data:

1. Duplicate an existing request (right-click → Duplicate)
2. Rename it
3. Modify the JSON body with your data
4. Click **Send**

## 🔍 Testing Different Scenarios

### Test Empty Data:
Use "Generate Visit Report - Minimal Data" to see how empty states are handled.

### Test Large Payloads:
Add more items to arrays (diagnoses, prescriptions, etc.)

### Test Different Formats:
Try Letter, Legal, A3 formats with different content.

## 📝 Notes

- **Base64 Size:** Large PDFs will have very long base64 strings (normal behavior)
- **Timeout:** Complex PDFs may take 5-10 seconds to generate
- **Rate Limit:** Default is 100 requests per 15 minutes per IP
- **Max Payload:** 10MB request size limit

## 🆘 Troubleshooting

### "Connection refused" error
- Make sure server is running: `npm run dev`
- Check `base_url` in environment matches your server

### "Template not found" error
- Check template name spelling
- Ensure template file exists in `src/templates/`

### Invalid JSON
- Use Postman's JSON validator (bottom right of body editor)
- Check for missing commas or quotes

---

**Tip:** Use Postman's **Collections Runner** to test all endpoints at once!

