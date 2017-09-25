"use strict";
const base = require('./base');

/*CONTROLLERS DEFS*/
const apiController = require('../controllers/api_controller');

/*OBJS*/
const api = new apiController();

/*ROUTES*/
//http://localhost:3001/getUser?id=30&email=llll
base.get('/API/getUser/:nick?:email?:id?', api.getUser);
base.get('/API/getUsers', api.getUsers);

module.exports = base;
