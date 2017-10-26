"use strict";

const userCtrl = require('../crud')

const userModel = require('../../models/user');
const communityModel = require('../../models/community');

const user = new userModel.UserActions();
const community = new communityModel.CommunityActions()

class CommunityAPI
{
    findCommunity(req,res)
    {
        if(req.query.name || req.query.inv_token || req.query.title)
        {
            
            community.getCommunities()
            
        }else return res.status(400).send(error: "Incomplete request");
    }
}
