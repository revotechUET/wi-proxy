let config = require('config');

module.exports = {
    targetHost: process.env.WI_BACKEND_LOCAL || config.get("local.wi_backend") || 'http://localhost:3000',
    skipsUrls: ['/project/well/dataset/curve/new-raw-curve']
};