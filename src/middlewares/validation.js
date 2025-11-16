/**
 * Validate request body size
 */
export function validatePayloadSize(req, res, next) {
  const contentLength = req.headers['content-length'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Payload too large. Maximum size is 10MB',
    });
  }

  next();
}

/**
 * Validate PDF options
 */
export function validatePDFOptions(req, res, next) {
  const { options } = req.body;

  if (options) {
    // Validate format
    const validFormats = ['A4', 'Letter', 'Legal', 'A3', 'A5', 'Tabloid'];
    if (options.format && !validFormats.includes(options.format)) {
      return res.status(400).json({
        success: false,
        error: `Invalid format. Allowed values: ${validFormats.join(', ')}`,
      });
    }

    // Validate landscape
    if (options.landscape !== undefined && typeof options.landscape !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Landscape must be a boolean value',
      });
    }
  }

  next();
}

/**
 * Validate template specifications (required)
 */
export function validateTemplateSpecs(req, res, next) {
  const { template_specifications } = req.body;

  // template_specifications is required
  if (!template_specifications) {
    return res.status(400).json({
      success: false,
      error: 'template_specifications is required',
    });
  }

  // Validate that id exists (required)
  if (!template_specifications.id) {
    return res.status(400).json({
      success: false,
      error: 'template_specifications.id is required',
    });
  }

  // Validate id is a string or number
  if (typeof template_specifications.id !== 'string' && typeof template_specifications.id !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'template_specifications.id must be a string or number',
    });
  }

  // Validate folder if provided
  if (template_specifications.folder && typeof template_specifications.folder !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'template_specifications.folder must be a string',
    });
  }

  // Validate locale if provided
  if (template_specifications.locale && typeof template_specifications.locale !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'template_specifications.locale must be a string',
    });
  }

  next();
}


