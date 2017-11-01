"use strict";
const base = require('./base'),
auth = require('../middlewares/auth');

/*CONTROLLERS DEFS*/
const ctrl = require('../controllers/controller');

/*OBJS*/
const communityAPI = new ctrl.CommunityAPI();

/*ROUTES*/
base.get('/API/community/loginUser/:email?:nick?:password?', auth, communityAPI.loginUser);
base.get('/API/community/getUsers/:type?:group?:nick?:email?', auth, communityAPI.getUsersCommunity);

base.get('/API/findCommunities/:query?', communityAPI.findCommunities);
//http://localhost:3001/getUser?id=30&email=llll
// base.get('/API/getUser/by/:nick?:email?:id?', api.getUser);
// base.get('/API/getUsers', api.getUsers);

module.exports = base;
