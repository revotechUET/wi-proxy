const router = require('express').Router();


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

router.use(upload.single('data'));


router.use(proxyRoute);

module.exports = router;