"use strict";

/*IMPORT PACKAGES*/
const express = require('express');
// const pug = require('pug');
const bodyParser = require('body-parser');

/*PATHS*/
const publicDir = express.static(`${__dirname}/public`);
// const viewsDir = `${__dirname}/views`;
const routes = require('./routes/router');
const conf = require('./conf');

/*SETTINGS*/
process.setMaxListeners(0);
const port = process.env.PORT || conf.server.port;

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
