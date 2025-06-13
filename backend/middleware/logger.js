const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

  console.log(`[${timestamp}] ${method} ${url} - ${ip}`);

  // Log request body for POST/PUT/PATCH requests (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };
    // Remove sensitive fields
    delete logBody.password;
    delete logBody.token;
    delete logBody.accessToken;
    delete logBody.refreshToken;
    console.log('Request Body:', JSON.stringify(logBody, null, 2));
  }

  next();
};

module.exports = logger;