"use strict";

const userCtrl = require('../crud')

const userModel = require('../../models/user');
const communityModel = require('../../models/community');

const user = new userModel.UserActions();
const community = new communityModel.CommunityActions()

class CommunityAPI
{
    getUsersCommunity(req, res)
    {
        
    }
}