"use strict";
const base = require('./base');

/*CONTROLLERS DEFS*/
const lsController = require('../controllers/ls_controller');

/*OBJS*/
const signup = new lsController.Signup();
const login = new lsController.Login();

/*ROUTES*/
base.post('/newUser',signup.signupUser);
base.post('/newCommunity',signup.signupCommunity);

base.post('/login',login.user);

module.exports = base;
