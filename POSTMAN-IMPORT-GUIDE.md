# Postman Import Guide

## Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **Upload Files**
4. Choose `postman-collection.json`
5. Click **Import**

### 2. Import the Environment (Optional)

1. Click **Import** again
2. Select `postman-environment.json`
3. Click **Import**
4. Select the environment from the dropdown (top right)

### 3. Start Testing!

The collection includes **10 requests**:

#### ✅ Basic Tests
- **Health Check** - Verify the API is running
- **Generate PDF - Visit Report** - Full example with embedded labels
- **Generate PDF - Root Template** - Template from root folder

#### 🌍 Locale Tests
- **Generate PDF with Locale** - Uses Macedonian translations (mk.json)
- **Visit Report - Dedicated Endpoint** - With anamnesis data

#### 📄 Format Options
- **Generate PDF - Landscape** - Test landscape orientation

#### 🔧 Alternative Inputs
- **Generate from HTML** - Convert raw HTML to PDF
- **Generate from URL** - Convert webpage to PDF

#### ❌ Error Tests
- **Error - Missing template_specifications** - Test validation
- **Error - Missing template ID** - Test validation

## Collection Features

### ✨ Includes

1. **Automated Tests** - Each request has test scripts to verify responses
2. **Complete Examples** - Real-world data in request bodies
3. **Multiple Scenarios** - Different templates, locales, and formats
4. **Error Handling** - Test error cases
5. **Environment Variables** - Easy to switch between dev/staging/prod

### 📋 Request Structure

All template-based requests use this format:

```json
{
  "template_specifications": {
    "folder": "reports",      // Optional
    "id": "anamnesis",         // Required
    "locale": "en"             // Optional
  },
  "data": { ... },
  "options": {
    "format": "A4",
    "landscape": false
  }
}
```

## Customization

### Change Base URL

**Method 1: Environment Variable (Recommended)**
1. Click the environment dropdown (top right)
2. Click the eye icon 👁️
3. Edit `baseUrl` value (e.g., `https://api.yourapp.com`)

**Method 2: Collection Variable**
1. Click the collection (PDF Service API)
2. Go to **Variables** tab
3. Edit `baseUrl` value

### Add Authorization

If you add authentication later:

1. Select the collection
2. Go to **Authorization** tab
3. Choose your auth type (Bearer Token, API Key, etc.)
4. All requests will inherit this

### Save Responses

To save PDF responses for viewing:

1. Add this to a request's **Tests** tab:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("lastPdfBase64", jsonData.data.base64);
}
```

2. View the saved base64 in your environment variables

## Tips

### 🎯 Running All Tests

1. Click the collection name
2. Click **Run**
3. Select which requests to run
4. Click **Run PDF Service API**

### 📊 View Test Results

After running requests, check the **Test Results** tab to see:
- ✅ Passed tests
- ❌ Failed tests
- Response times

### 🔍 View Generated PDFs

Two options:

**Option 1: Online Viewer**
1. Copy the base64 string from response
2. Go to https://base64.guru/converter/decode/pdf
3. Paste and view

**Option 2: Use test-pdf-viewer.html**
1. Open `test-pdf-viewer.html` in browser
2. Paste base64 string
3. View PDF inline

### 🚀 Pro Tips

1. **Use Variables** - Store commonly used data in variables
2. **Pre-request Scripts** - Generate dynamic data (dates, IDs)
3. **Environment Switching** - Create dev/staging/prod environments
4. **Documentation** - Add descriptions to help your team

## Troubleshooting

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution:** Make sure the server is running
```bash
npm run dev
```

### 400 Bad Request

**Check:**
- `template_specifications` is included
- `template_specifications.id` is present
- JSON is valid

### 500 Server Error

**Check:**
- Template file exists in correct folder
- Template filename matches `id` field
- Server logs for details

## Example: Test All Endpoints

1. Start server: `npm run dev`
2. Open Postman
3. Import collection
4. Click **Run** collection
5. Select all requests
6. Click **Run PDF Service API**
7. View results!

## Files

- **postman-collection.json** - Main collection with all requests
- **postman-environment.json** - Environment with baseUrl variable

---

Happy Testing! 🚀

