"use strict";

const userModel = require('../models/user'),
    communityModel = require('../models/community'),
    hash = require('../services/hash');

const User = new userModel.userActions();
const Community = new communityModel.communityActions();

/*REGISTRATION CONTROL*/
class Signup
{
    signupUser(req,res)
    {
        let newUser= new userModel.user(
        {
            email : req.body.email,
            nick : req.body.nick,
            name : req.body.name,
            second_name : req.body.second_name || null,
            last_name : req.body.last_name,
            second_last_name: req.body.second_last_name || null,
            password : req.body.password,
            gender: req.body.gender,
            avatar: req.body.avatar || null,
            lastLogin: Date.now()
        });

        User.registerUser(newUser,(ok,msg)=>
        {
            if(ok)
                return res.status(200).send({info: msg,token: hash.createToken(newUser)}); 
            
            return res.status(400).send(msg);            
        });
    }  

    signupCommunity(req,res,next)
    {
        console.log(req.body);
        let newCommunity =
        {
            name : req.body.name,
            title : req.body.title,
            description : req.body.description || null,
            logo: req.body.logo || null,
            creator: req.body.creator,
            inv_token: Community.generateCommunityToken(req.body.name),
            user_admin: (req.body.user_admin).split(","),
            user_moderator: (req.body.user_moderator).split(",") || null,
            privacy: req.body.privacy
        };
        console.log(newCommunity);
        Community.registerCommunity(newCommunity,(ok,msg)=>
        {
            if(ok) return res.status(200).send({info:msg,name: newCommunity.name,inv_token:newCommunity.inv_token});
            else return res.status(400).send(msg);            
        });
    }
}

class Login
{
    loginUser(req,res,next)
    {
        console.log(req.body)
        if(req.body)
        {
            User.passUser(req.body,(ok,msg)=>
            {
                if(ok)
                {
                    req.user = msg;
                    let token = hash.createToken(msg);              
                    return res.status(200).send({info: msg,token: token}); 
                }
                
                return res.status(400).send({info: msg}); 
                
            }); 
        }else return res.status(400).send({info: {error:"need to provide a request body"}});  
    }
}

module.exports = {Signup, Login};
