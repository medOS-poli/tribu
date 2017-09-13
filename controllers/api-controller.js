"use strict";

const userModel = require('../models/user');
const communityModel = require('../models/community');
const user = new userModel();

class API
{
  getUser(req,res,cb)
  {
    let who =
    {
      nick: req.query.nick || null,
      email: req.query.email || null,
      id: req.query.id || null,
    }

    user.get(who,(ok,data)=>
    {
      if(ok) cb(data);
    });
  }

  getUsers(req,res,next)
  {
    user.getAll((ok,data)=>
    {
      if(ok) res.status(200).send(data);
    });
  }
}

module.exports = API;
