"use strict";
const hat = require('hat');
const mongoose = require('./db');
const schema = mongoose.Schema;
const user = require('./user');

const communityObject =
{
  _id : {type: schema.Types.ObjectId, select: false},
  name : {type:String, required:true, unique:true },
  title : {type: String, required:true},
  description : String,
  logo : String,
  creator: {type: schema.Types.ObjectId, ref: 'User', require: true},
  inv_token : {type: String, unique:true, required:true},
  user_admin: [{type: schema.Types.ObjectId, ref: 'User' }],
  user_moderator: [{type: schema.Types.ObjectId, ref: 'User' }],
  users: [{type: schema.Types.ObjectId, ref: 'User' }],
  creationDate: {type: Date, default: Date.now()},
  privacy: {type:String, enum:['Private','Public'], default: 'Public', require: true},
  requests: {
    users: [{type: schema.Types.ObjectId, ref: 'User'}]
  }
};

const communitySchema = new schema(communityObject,{collection : "community"});

const community = mongoose.model('Community',communitySchema);

class communityModel
{
  registerCommunity(data, cb)
  {
    community.create(data, (err)=>
    {
      if(err)
      {
        console.log(err);
        cb(false,{error: err});
      }
      else cb(true,data);
    });
  }

  generateCommunityToken(data)
  {
    let token = hat();
    return data+token.slice(0,4);
  }

  registerUser(user,cb)
  {

  }
}

module.exports = communityModel;
