const express = require('express');
const config = require('config');
const app = express();

const port = process.env.PORT || config.get("host.port") || 3033;


app.listen(port, ()=>{
    console.log('App start listen in port ', port);
});