const express = require('express');
const config = require('config');

const wiAuthRoute = require('./server/router/wi-auth/wi-auth.route');
const wiBackendRoute = require('./server/router/wi-backend/wi-backend.route');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();

app.use(bodyParser.json({limit: '50mb', extended: true, type: 'application/json'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, type: 'application/json'}));
app.use(cors());


const port = process.env.PORT || config.get("host.port") || 3033;

app.use('/auth', wiAuthRoute);
app.use('/backend', wiBackendRoute);

app.listen(port, ()=>{
    console.log('App start listen in port ', port);
});

