const rateLimit = require('express-rate-limit');
const messages = require('../utils/response/limiter');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: messages.errors.rate_limit,
});

module.exports = limiter;
