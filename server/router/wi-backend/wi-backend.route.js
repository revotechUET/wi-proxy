const router = require('express').Router();

let proxyConfig = require('./wi-backend.config');

let proxyRouteOf = require('./../../helper/proxy.helper');
let proxyRoute = proxyRouteOf(proxyConfig);

router.use(proxyRoute);

module.exports = router;