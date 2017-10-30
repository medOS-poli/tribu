"use strict";

const userModel = require('../../models/user'),
    communityModel = require('../../models/community'),
    hash = require('../../services/hash');


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
    
    findCommunities(req,res)
    {
        if(req.query.query)
        {        
            let query = req.query.query;
            let match = { $or: [ {title: {'$regex': query, '$options': 'i'}},{description: {'$regex': query, '$options': 'i'}},{name: {'$regex': query, '$options': 'i'}} ], $and: [ {$or: [{privacy: "OPEN"}, {privacy:"PUBLIC"}] } ] };
            let exclude = {creator: 0, inv_token:0, user_admin: 0, user_moderator: 0, users: 0, requests:0, secret: 0, _id:0};
            
            community.getCommunities(match,exclude,(ok,msgCommunities)=>
            {                
                if(ok) return res.status(200).send(msgCommunities);
                else return res.status(msgCommunities.status).send({error: msgCommunities.error});
            }); 
           
        }else return res.status(400).send({message: "Incomplete query"});
        
    }
    
    loginUser(req,res)
    {
        if((req.query.nick || req.query.email) && req.query.password)
        {            
            user.passUser(req.query,(ok, msgPassUser)=>
            {
                if(ok)
                {
                    let communityName= {name: req.auth.name};
                    let query = { $or:[  {"user.email": msgPassUser.email }, {"user.nick": msgPassUser.nick} ]};
                    
                    community.getUsers(communityName, query, (ok, msgUser)=>
                    {
                        
                        if(ok)
                        {
                            let token = hash.createUserToken(msgUser);

                            return res.status(200).send({type: msgUser[0].type, user: msgUser[0].user[0], token: token});
                            
                        }else return res.status(msgUser.status).send({error:msgUser.error})
                        
                    });                   
                    
                }else return res.status(msgPassUser.status).send({error: msgPassUser.error});
                
            });
            
        }
    }
}

module.exports = CommunityAPI;
