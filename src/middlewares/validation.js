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


