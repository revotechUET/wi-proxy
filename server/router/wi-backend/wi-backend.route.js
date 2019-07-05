const router = require('express').Router();
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

let proxyConfig = require('./wi-backend.config');

let proxyRouteOf = require('./../../helper/proxy.helper');
let proxyRoute = proxyRouteOf(proxyConfig);
const multer = require('multer');

let uploadDir = 'uploads';

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

let upload = multer({storage: storage});

router.post('/project/well/dataset/curve/new-raw-curve', upload.single('data'), async (req, res)=> {
    try {
        let formData = new FormData();
        let keyArr = Object.keys(req.body);
        for (let i in keyArr) {
            formData.append(keyArr[i], req.body[keyArr[i]]);
        }
        formData.append('data', fs.createReadStream(req.file.path));
        console.log(formData);
        let headers = formData.getHeaders();
        let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization') || req.query.token;
        headers.Authorization = token;
        let response = await axios.post(
            proxyConfig.targetHost + '/project/well/dataset/curve/new-raw-curve',
            formData,
            {
                headers: headers
            }
        );
        // console.log(response.data);
        res.status(response.data.code).json(response.data);
    } catch (e) {
        console.log(e);
    }

});

router.use(proxyRoute);

module.exports = router;