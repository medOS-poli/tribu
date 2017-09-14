"use strict";

const userModel = require('../models/user');
const communityModel = require('../models/community');

const user = new userModel();
const community = new communityModel();

/*REGISTRATION CONTROL*/
class Signup
{
  signupUser(req,res,next)
  {
    let newUser= new user(
    {
      _id: (req.body._id || null),
      email : req.body.email,
      nick : req.body.nick,
      name : req.body.name,
      second_name : req.body.second_name,
      last_name : req.body.last_name,
      second_last_name: req.body.second_last_name,
      password : req.body.password,
      gender: req.body.gender,
      lastLogin: Date.now()
    });

    user.registerUser(newUser,(ok,msg)=>
    {
      if(ok)
      {
        console.log("USER ADDED");
        res.status(200).send(newUser);
      }else
      {
        console.log("USER REGISTRATION FAILED");
        res.status(400).send(msg);
      }
    });
  }

  signupCommunity(req,res,next)
  {
    let newCommunity = new community(
    {
      _id: (req.body._id || null),
      name : req.body.name,
      title : req.body.title,
      description : req.body.description,
      creator: req.body.creator,
      inv_token: community.generateCommunityToken(req.body.name),
      user_admin: req.body.user_admin,
      user_moderator: req.body.user_moderator,
      users: req.body.users,
      privacy: req.body.privacy
    });

    community.registerCommunity(newCommunity,(ok,data)=>
    {
      if(ok)
      {
        console.log("COMMUNITY ADDED");
        res.status(200).send(data);
      }else
      {
        console.log("COMMUNITY REGISTRATION FAILED");
        res.status(400).send(data);
      }
    });
  }
}

class Login
{
  user(req,res,next){}
}

module.exports = {Signup, Login};
