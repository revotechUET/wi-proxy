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
        url = url.slice(baseUrl.length, url.length - 1);

        //in skip list then next()
        if (skipUrls.includes(url)) {
            next();
        }

        //make sure that there is no '/' in header of url string
        if (url.indexOf('/') === 0) {
            url = url.slice(1, url.length - 1);
        }
        url = targetHost + '/' + url;


        let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization') || req.query.token;

        //request
        try {
            let response = await axios({
                method: req.method.toLowerCase(),
                url: url,
                data: req.body,
                headers: {
                    'Authorization': token
                }
            });
            res.json(response);
        } catch (e) {
            console.log('Proxy route error: ', e);
            res.json(responseTemplate(CODES.INTERNAL_SERVER_ERROR, 'Server not response', {}));
        }
    }
}

module.exports = proxyRouteOf;
