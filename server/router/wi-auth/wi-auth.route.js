const router = require('express').Router();
const axios = require('axios');
let config = require('config');
const https = require('https');

const CODES = require('./../../helper/response.helper').CODES;
const responseTemplate = require('./../../helper/response.helper').response;
let proxyConfig = require('./wi-auth.config');

let commandExec = require('./../../helper/commandExec.helper');

let wiAuthCloudUrl = process.env.WI_AUTH_CLOUD || config.get("cloud.wi_auth") || 'https://users.i2g.cloud';

let proxyRouteOf = require('./../../helper/proxy.helper');
let proxyRoute = proxyRouteOf(proxyConfig);

router.use(proxyRoute);

router.post('/login', async (req, res)=>{
    //try if there is account exist or not
    try {
        let response = await axios.post(proxyConfig.targetHost + '/login', req.body);

        //if this account is not exist in local
        if (response.data.reason === 'User is not exists.') {
            //check if cloud server has this account
            const agent = new https.Agent({
                rejectUnauthorized: false
            });
            let responseAuthCloud = await axios.post(wiAuthCloudUrl + '/login',
                req.body, {
                    httpsAgent: agent
                });
            if (responseAuthCloud.data.reason === 'Successful') {
                //LOGIN ON SERVER SUCCESSFULLY
                //CLONE
                console.log('this account exist on cloud');
            }
        }
        res.status(response.data.code).json(response.data);
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;