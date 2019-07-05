const axios = require('axios');
let CODES = require('./response.helper').CODES;
let responseTemplate = require('./response.helper').response;

function proxyRouteOf(hostConfig) {
    let skipUrls = hostConfig.skipUrls;
    if (!skipUrls) skipUrls = [];
    let targetHost = hostConfig.targetHost;
    return async function(req, res, next) {
        let baseUrl = req.baseUrl;
        let url = req.originalUrl;
        url = url.slice(baseUrl.length, url.length);

        //in skip list then next()
        if (skipUrls.includes(url)) {
            next();
            return;
        }

        //make sure that there is no '/' in head of url string
        if (url.indexOf('/') === 0) {
            url = url.slice(1, url.length);
        }
        url = targetHost + '/' + url;

        let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization') || req.query.token;

        //request
        try {
            let optionRequest = {
                method: req.method.toLowerCase(),
                url: url,
                data: req.body,
            };

            //add token if there is a token
            if (token) {
                optionRequest.headers = {};
                optionRequest.headers['Authorization'] = token;
            }

            //request and response
            let response = await axios(optionRequest);
            res.status(response.data.code).json(response.data);
        } catch (e) {
            console.log('Proxy route error: ', e);
            res.json(responseTemplate(CODES.INTERNAL_SERVER_ERROR, 'Server not response', {}));
        }
    }
}

module.exports = proxyRouteOf;
