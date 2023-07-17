const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Превышено количество запросов на сервер. Попробуйте повторить позже',
});

module.exports = limiter;
