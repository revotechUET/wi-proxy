let config = require('config');

let proxyConfig = {
    targetHost: process.env.WI_AUTH_LOCAL || config.get("local.wi_auth") || 'http://localhost:2999',
    skipUrls: ['/login']
};

module.exports = proxyConfig;