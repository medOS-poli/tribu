"use strict";

const userModel = require('../models/user'),
    communityModel = require('../models/community'),
    groupModel = require('../models/group'),
    hash = require('../services/hash');

const User = new userModel.userActions();
const Community = new communityModel.communityActions();
const Group = new groupModel.groupActions();

const emailRegex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i

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
            second_name : req.body.second_name || '',
            last_name : req.body.last_name,
            second_last_name: req.body.second_last_name || '',
            password : req.body.password,
            gender: req.body.gender,
            avatar: req.body.avatar || '',
            lastLogin: Date.now()
        });

        if((newUser.email).includes (' ') ||
            (newUser.nick).includes (' ') ||
            (newUser.gender).includes (' ') ||
            (newUser.avatar).includes (' ') ||
            !emailRegex.test(newUser.email)
        ) return res.status(400).send({error:"Formating error"});

        console.log(req.body,newUser);

        User.registerUser(newUser, (ok, msg) =>
        {
            if(ok) return res.status(200).send({info: msg, token: hash.createToken(newUser)});
            return res.status(400).send(msg);
        });
    }

    signupCommunity(req,res)
    {
        console.log("USER TRYING TO CREATE COMMUNITY:", req.user)
        if(req.user.id)
        {
            let newCommunity =
            {
                name : req.body.name,
                title : req.body.title,
                description : req.body.description || '',
                logo: req.body.logo || '',
                creator: req.user.id,
                inv_token: Community.generateCommunityToken(req.body.name),
                user_admin:req.body.user_admin?(req.body.user_admin).split(","):[],
                user_moderator: req.body.user_moderator? (req.body.user_moderator).split(",") : [],
                privacy: req.body.privacy
            };
            if(newCommunity.name.includes (' ') || newCommunity.logo.includes (' ')) return res.status(400).send("The name can't have spaces");
            Community.registerCommunity(newCommunity,(ok,msg)=>
            {
                if(ok) return res.status(200).send({info:msg,name: newCommunity.name,inv_token:newCommunity.inv_token});

                return res.status(400).send(msg);

            });

        } else return res.status(500).send({message: "Something wrong happened"});

    }

    signupUserCommunity(req,res)
    {
        if((req.body.nick || req.body.email) && (req.body.name || req.body.inv_token))
        {
            User.getUser({$or:[{email:req.body.email},{nick:req.body.nick}]}, (ok,msgUser)=>
            {
                if(ok)
                {
                    Community.getCommunity({$or:[{inv_token:req.body.inv_token},{name:req.body.name}]},(ok,msgCommunity)=>
                    {
                        if(ok)
                        {
                            console.log(msgCommunity)
                            //Verificar el tipo de comunidad
                            switch (msgCommunity.privacy)
                            {
                                //{$set:{'users.$.user_id':msgUser._id}}
                                case "OPEN":
                                {
                                    Community.registerUser({$or:[{name:msgCommunity.name},{inv_token:msgCommunity.inv_token}]}, {"$push":{users:msgUser._id}},(ok,obj)=>
                                    {
                                        if(ok) return res.status(200).send({message:"User added to community"});
                                        return res.status(500).send({error:obj});

                                    });
                                }break;
                                case "PUBLIC":
                                {
                                    Community.registerRequest({$or:[{name:msgCommunity.name},{inv_token:msgCommunity.inv_token}]}, {"$push":{requests:msgUser._id}},(ok,obj)=>
                                    {

                                            if(ok) return res.status(200).send({message:"Request sent"});
                                            return res.status(500).send({error:obj});
                                    });
                                } break;
                                case "PRIVATE":
                                {
                                   if(req.body.inv_token && req.body.inv_token===msgCommunity.inv_token)
                                   {
                                      Community.registerRequest({$or:[{name:msgCommunity.name},{inv_token:msgCommunity.inv_token}]}, {"$push":{requests:msgUser._id}},(ok,obj)=>
                                      {

                                            if(ok) return res.status(200).send({message:"Request sent"});
                                            return res.status(500).send({error:obj});

                                      });

                                   } else res.status(400).send({message:"Need an invitation token"})
                                }

                                ;break;
                            }
                        }else return res.status(400).send({message:"Community doesn't exist"});
                    });
                } else return res.status(400).send({message:"User doesn't exist"});
            });
        } else return res.status(400).send({message:'Need request body'});

    }

    signupGroupCommunity(req,res)
    {
        if(req.body.name || req.body.inv_token)
        {
            if(req.user.id)
            {
                Community.getCommunity({$or:[{inv_token:req.body.inv_token},{name:req.body.name}]},(ok,msgCommunity)=>
                {
                    if(ok)
                    {
                        if((msgCommunity.users).includes(req.user.id))
                        {
                            Group.registerGroup();

                        }else res.status(500).send({message: "You need to be part of the community to create a group"});
                    }else return res.status(400).send(msgCommunity);
                });

            }else return res.status(400).send("Need to authenticate first");
        }else return res.status(400).send("Need community name or invitation token");

    }

}

class Login
{
    loginUser(req,res,next)
    {
        console.log(req.body)
        if(req.body)
        {
            User.passUser(req.body, (ok,msg) =>
            {
                if(ok)
                {
                    req.user = msg;
                    let token = hash.createToken(msg);
                    return res.status(200).send({info: "Logged  "+ msg.email, token: token});
                }

                return res.status(400).send({info: msg});

            });
        } else return res.status(400).send({info: {error:"need to provide a request body"}});
    }
}

class Update
{
    updateCommunity(req, res)
    {
        console.log("USER TRYING TO UPDATE COMMUNITY:", req.user);
        console.log('id del usuario: ', req.user.id);

        Community.getCommunity({inv_token: req.body.inv_token}, (ok, msgCommunity) =>
        {
            if(ok)
            {
                console.log('Nombre: ', msgCommunity.name)
                console.log('Admin: ', msgCommunity.user_admin)

                if((req.user.id).includes(msgCommunity.creator))
                {
                    let newCommunity =
                    {
                        name : req.body.name,
                        title : req.body.title,
                        description : req.body.description || '',
                        logo: req.body.logo || '',
                        user_admin:req.body.user_admin?(req.body.user_admin).split(","):[],
                        user_moderator: req.body.user_moderator? (req.body.user_moderator).split(",") : [],
                        privacy: req.body.privacy
                    };

                    msgCommunity.update({name: newCommunity.name,
                                        title: newCommunity.title,
                                        description: newCommunity.description,
                                        logo: newCommunity.logo,
                                        user_admin: newCommunity.user_admin,
                                        user_moderator: newCommunity.user_moderator,
                                        privacy: newCommunity.privacy}, (ok, obj) =>
                    {
                        (ok) ? res.status(200).send({ message:"community updated" }) : res.status(500).send({ error: obj });
                    })

                    console.log('eres admi');
                } else res.status(500).send({message: "You need admin of the community to create a group"});
            }
        })
    }

    updateUser(req, res)
    {
        console.log('id del usuario: ', req.user.id);
        
        User.getUser({email: req.body.email}, (ok, msgUser) =>
        {
            if(ok)
            {
                if((msgUser.email).includes(req.user.email) || (msgUser.nick).includes(req.user.nick))
                {
                    let newUser =
                    {
                        email : req.body.email,
                        nick : req.body.nick,
                        name : req.body.name,
                        second_name : req.body.second_name,
                        last_name : req.body.last_name,
                        second_last_name: req.body.second_last_name,
                        password : req.body.password,
                        gender : req.body.password,
                        avatar : req.body.password,
                    };

                    msgUser.update({email: newUser.email,
                        nick: newUser.nick,
                        name: newUser.name,
                        second_name: newUser.second_name,
                        last_name: newUser.last_name,
                        second_last_name: newUser.second_last_name,
                        password: newUser.password,
                        gender: newUser.gender,
                        avatar: newUser.avatar}, (ok, obj) =>
                    {
                        if(ok) return res.status(200).send({message:"user updated"});
                        return res.status(500).send({error:obj});
                    })

                } else res.status(500).send({message: "Error to update User"});
            }
        })
    }
}

class Delete
{
    deleteCommunity(req, res, next)
    {
        console.log("USER TRYING TO DELETE COMMUNITY:", req.user);
        console.log('id del usuario: ', req.user.id);

        Community.getCommunity({inv_token: req.body.inv_token}, (ok, msgCommunity) =>
        {
            if(ok)
            {
                console.log('Nombre: ', msgCommunity.name)
                console.log('Admin: ', msgCommunity.user_admin)

                if((req.user.id).includes(msgCommunity.creator))
                {
                    let name = req.body.name;

                    msgCommunity.remove({name: name}, (ok, obj) =>
                    {
                        if(ok) return res.status(200).send({message:"community deleted"});
                        return res.status(500).send({error:obj});
                    })

                    console.log('eres admi');
                } else res.status(500).send({message: "You need admin of the community to delete a group"});
            }
        })
    }
}

module.exports = {Signup, Login, Update, Delete};
