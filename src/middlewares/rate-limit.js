const { rateLimit } = require("express-rate-limit");

const limiter = rateLimit({
  // windowMs: 15 * 60 * 1000, // 15 minutes
  // limit: 100, // limit each IP to 100 requests per windowMs (here, per 15 minutes)
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 100, // limit each IP to 100 requests per windowMs (here, per 1 minute)
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
});

module.exports = limiter;
