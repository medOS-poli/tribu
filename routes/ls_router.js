"use strict";
const base = require('./base'),
    auth = require('../middlewares/auth');
    
/*CONTROLLERS DEFS*/
const lsController = require('../controllers/ls_controller');

/*OBJS*/
const signup = new lsController.Signup();
const login = new lsController.Login();

/*ROUTES*/
base.post('/newUser',signup.signupUser);
base.post('/newCommunity',auth,signup.signupCommunity);

base.post('/login',login.loginUser);

module.exports = base;
