const {rateLimit} = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
})

module.exports = limiter;