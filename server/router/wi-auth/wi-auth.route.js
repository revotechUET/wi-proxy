const router = require('express').Router();
const axios = require('axios');
let config = require('config');
const https = require('https');

const CODES = require('./../../helper/response.helper').CODES;
const responseTemplate = require('./../../helper/response.helper').response;
let proxyConfig = require('./wi-auth.config');

let commandExec = require('./../../helper/commandExec.helper');

let wiAuthCloudUrl = process.env.WI_AUTH_CLOUD || config.get("cloud.wi_auth") || 'https://users.i2g.cloud';
let wiAuthLocalUrl = process.env.WI_AUTH_LOCAL || config.get("local.wi_auth") || 'http://localhost:2999';

let proxyRouteOf = require('./../../helper/proxy.helper');
let proxyRoute = proxyRouteOf(proxyConfig);

router.use(proxyRoute);

//create agent for https request
const agent = new https.Agent({
    rejectUnauthorized: false
});


router.post('/login', async (req, res)=>{
    //try if there is account exist or not
    try {
        let response = await axios.post(proxyConfig.targetHost + '/login', req.body);

        //if this account is not exist in local
        if (response.data.reason === 'User is not exists.') {
            //check if cloud server has this account
            let responseAuthCloud = await axios.post(wiAuthCloudUrl + '/login',
                req.body, {
                    httpsAgent: agent
                });
            if (responseAuthCloud.data.reason === 'Successful') {
                //LOGIN ON SERVER SUCCESSFULLY
                let token = responseAuthCloud.data.content.token;
                let idCompany = responseAuthCloud.data.content.company.idCompany || null;
                await makeCompanyExist(responseAuthCloud.data.content.company, token);
                responseAuthCloud = await axios.post(wiAuthLocalUrl + '/user/new', {
                    username: req.body.username,
                    password: req.body.password,
                    idCompany: idCompany,
                    status: 'Active'
                }, {
                    httpsAgent: agent,
                    headers: {
                        Authorization: token
                    }
                });
                console.log(responseAuthCloud.data);
                if (responseAuthCloud.data.code === 200) {
                    let anotherResponse = await axios.post(wiAuthLocalUrl + '/login', req.body);
                    res.status(anotherResponse.data.code).json(anotherResponse.data);
                    return;
                }
            }
        }
        res.status(response.data.code).json(response.data);
    } catch (e) {
        console.log(e);
    }
});


async function makeCompanyExist(company, token) {
    //check if exist
    let res = await axios.post(wiAuthLocalUrl + '/company/info', {
        idCompany: company.idCompany
    }, {
        httpsAgent: agent,
        headers: {
            Authorization: token
        }
    });
    if (res.data.code === 200) return;
    await axios.post(wiAuthLocalUrl + '/company/new', company, {
        httpsAgent: agent,
        headers: {
            Authorization: token
        }
    });
};

module.exports = router;