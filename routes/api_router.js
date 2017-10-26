"use strict";
const base = require('./base'),
auth = require('../middlewares/auth');

/*CONTROLLERS DEFS*/
const apiController = require('../controllers/controller').ApiCtrl;

/*OBJS*/
const communityAPI = new apiController.CommunityAPI.CommunityAPI();

/*ROUTES*/
base.get('/API/community/getusers/:type?:group?', auth, communityAPI.getUsersCommunity);
//http://localhost:3001/getUser?id=30&email=llll
// base.get('/API/getUser/by/:nick?:email?:id?', api.getUser);
// base.get('/API/getUsers', api.getUsers);

module.exports = base;
