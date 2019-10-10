const router = require('express').Router();
const axios = require('axios');
let config = require('config');
const https = require('https');

const CODES = require('./../../helper/response.helper').CODES;
const responseTemplate = require('./../../helper/response.helper').response;

// let commandExec = require('./../../helper/commandExec.helper');

let proxyConfig = require('./wi-auth.config');

let wiAuthCloudUrl = process.env.WI_AUTH_CLOUD || config.get("cloud.wi_auth") || 'https://users.i2g.cloud';
let wiAuthLocalUrl = process.env.WI_AUTH_LOCAL || config.get("local.wi_auth") || 'http://localhost:2999';
let wiSyncLocalUrl = process.env.WI_SYNC_LOCAL || config.get("wi_sync") || 'http://localhost:9099';
let wiBackendLocalUrl = process.env.WI_BACKEND_LOCAL || config.get("wi_backend") || 'http://localhost:3000';

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
        let response = await axios.post(wiAuthLocalUrl + '/login', req.body);
        
        let username = req.body.username;
        let password = req.body.password;

        //if this account is not exist in local
        if (response.data.reason.toString() === 'User is not exists.') {
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
                let responseAuthLocal = await axios.post(wiAuthLocalUrl + '/user/new', {
                    username: username,
                    password: password,
                    idCompany: idCompany,
                    status: 'Active'
                }, {
                    httpsAgent: agent,
                    headers: {
                        Authorization: token
                    }
                });
                axios.post(wiBackendLocalUrl + '/update', {}, {
                    headers:{
                        Authorization: token
                    }
                }).then((rs)=>{
                    if (parseInt(rs.data.code) === 200) { 
                        axios.post(wiSyncLocalUrl + '/sync/start', {
                            username: username
                        }).then((rs=>{
                            console.log('Sync', username + ':', rs.data);
                        })).catch(e=>{
                            console.log(e);
                        });
                    }
                }).catch(e=>{
                    console.log(e);
                });
                if (responseAuthLocal.data.code === 200) {
                    let anotherResponse = await axios.post(wiAuthLocalUrl + '/login', req.body);
                    res.status(anotherResponse.data.code).json(anotherResponse.data);
                    return;
                }
            } else {
                let resFromSync = await axios.post(WI_SYNC_LOCAL + '/sync/status', {username: username});
                if (resFromSync.data.payload.status.toString() = 'SYNCING') {
                    res.status(512).json({
                        code: 512,
                        reason: 'Database is syncing, can not login, please wait for ~10->30mins',
                        payload: {}
                    });
                } else {
                    res.status(responseAuthCloud.data.code).json(responseAuthCloud.data);
                }
                return;
            }
        }
        res.status(response.data.code).json(response.data);
    } catch (e) {
        console.log(e);
        res.status(CODES.INTERNAL_SERVER_ERROR).json(responseTemplate(CODES.INTERNAL_SERVER_ERROR, 'Server not response', {}));
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