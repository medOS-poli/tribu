"use strict";

const userModel = require('../../models/user');
const communityModel = require('../../models/community');

const user = new userModel.UserActions();
const community = new communityModel.CommunityActions()

class CommunityAPI
{
    getUsersCommunity(req, res)
    {
        if(req.auth.name)
        {
            let communityName= {name: req.auth.name};
            var query = {};
            
            if(req.query.type) query.type= req.query.type;
            
            community.getUsers(communityName, query ,(ok,msgUsers)=>
            {
                if(ok) return res.status(200).send(msgUsers); 
                else return res.status(msgUsers.status).send({error:msgUsers.error}); 
              
            });
            
            
        }else return res.status(401).send({message:"You don't have permission"})
    }
}

module.exports = CommunityAPI;
