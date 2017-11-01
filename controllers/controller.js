"use strict";

const controllers =
{
    /*CRUD*/
    
    UserCtrl: require('./crud/user_ctrl'),
    GroupCtrl: require('./crud/group_ctrl'),
    CommunityCtrl:  require('./crud/community_ctrl'),

    /*API*/
    
    CommunityAPI:  require('./api/community_api'),
    UserAPI: require('./api/user_api'),


};

module.exports = controllers;
