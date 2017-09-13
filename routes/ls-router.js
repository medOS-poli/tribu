"use strict";
const base = require('./base');

/*CONTROLLERS DEFS*/
const lsController = require('../controllers/ls-controller');

/*OBJS*/
const singup = new lsController.Singup();
const login = new lsController.Login();

/*ROUTES*/
base.post('/newUser',singup.user);
base.post('/newCommunity',singup.community);

base.post('/login',login.user);

module.exports = base;
