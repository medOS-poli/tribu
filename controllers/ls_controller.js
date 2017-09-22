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

        console.log(req.body,newUser);

        User.registerUser(newUser,(ok,msg)=>
        {
            if(ok)
                return res.status(200).send({info: msg,token: hash.createToken(newUser)}); 
            
            return res.status(400).send(msg);            
        });
    }  

    signupCommunity(req,res)
    {
        console.log("USER TRYING TO CREATE COMMUNITY:",req.user)
        if(req.user.id)
        {
            let newCommunity =
            {
                name : req.body.name,
                title : req.body.title,
                description : req.body.description || null,
                logo: req.body.logo || null,
                creator: req.user.id,
                inv_token: Community.generateCommunityToken(req.body.name),
                user_admin:req.body.user_admin?(req.body.user_admin).split(","):[],
                user_moderator: req.body.user_moderator? (req.body.user_moderator).split(",") : [],
                privacy: req.body.privacy
            };

            Community.registerCommunity(newCommunity,(ok,msg)=>
            {
                 if(ok) return res.status(200).send({info:msg,name: newCommunity.name,inv_token:newCommunity.inv_token});
               
                return res.status(400).send(msg);       
               
            }); 
            
        } else return res.status(500).send({message:"Something wrong happened"});
        
    }

    signupUserCommunity(req,res)
    {
        
        if((req.body.nick || req.body.email)&&(req.body.name ||req.body.inv_token))
        {
            User.getUser({$or:[{email:req.body.email},{nick:req.body.nick}]},(ok,msgUser)=>
            {
                if(ok)
                {
                    Community.getCommunity({$or:[{inv_token:req.body.inv_token},{name:req.body.name}]},(ok,msg)=>
                    {
                        if(ok)
                        {
                            console.log(msg)
                            //Verificar el tipo de comunidad
                            switch (msg.privacy)
                            {
                                //{$set:{'users.$.user_id':msgUser._id}} 
                                case "OPEN":
                                {                                   
                                    Community.registerUser({$or:[{name:msg.name},{inv_token:msg.inv_token}]}, {"$push":{users:msgUser._id}},(ok,obj)=>
                                    {
                                        if(ok) return res.status(200).send({message:"User added to community"});
                                        return res.status(200).send({error:obj});
                                        
                                    });
                                }
                                case "PUBLIC": return res.status(500).send({error:"Community is PUBLIC"});
                                case "PRIVATE": return res.status(500).send({error:"Community is PRIVATE"}); 
                            }
                        }else return res.status(400).send({message:"Community doesn't exist"});
                    });
                } else return res.status(400).send({message:"User doesn't exist"});
            });
        } else return res.status(400).send({message:'Need request body'});
        
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
                    return res.status(200).send({info: "Logged"+msg.email,token: token}); 
                }
                
                return res.status(400).send({info: msg}); 
                
            }); 
        }else return res.status(400).send({info: {error:"need to provide a request body"}});  
    }
}

module.exports = {Signup, Login};
