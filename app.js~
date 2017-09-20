"use strict";

/*IMPORT PACKAGES*/
const express = require('express'),
    bodyParser = require('body-parser');

/*PATHS*/
const publicDir = express.static(`${__dirname}/public`),
    routes = require('./routes/router'),
    conf = require('./conf');

const port = process.env.PORT || conf.server.port;

/*SETTINGS*/
process.setMaxListeners(0);

/*APP*/
let app = express();

/*APP PROPS*/
// app.set('views', viewsDir);
// app.set('view engine', 'pug');
app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use( publicDir );
app.use( routes );

module.exports = app;
