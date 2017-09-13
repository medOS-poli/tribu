"use strict"

const mongoose = require('mongoose');
const conf = require('./db-conf');

mongoose.connect(`mongodb:\/\/${conf.mongo.host}/${conf.mongo.db}`,
                 {useMongoClient: true});

module.exports = mongoose;
