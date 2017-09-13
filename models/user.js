"use strict";

const mongoose = require('./db');
const schema = mongoose.Schema;

const userObject =
{
  _id : {type: schema.Types.ObjectId, select: false},
  email : {type: String, lowercase:true, unique:true, required:true},
  nick : {type: String, unique: true, required: true},
  name : {type: String, required:true},
  second_name : String,
  last_name : {type: String, required: true},
  second_last_name: String,
  password : {type: String, select: false},
  gender: {type:String, enum:['M','F','O'], default:'O'},
  avatar: String,
  singupDate: {type: Date, default: Date.now()},
  lastLogin: Date,
  tags: [String]
};

const userSchema = new schema(userObject,{collection : "user"});
const user = mongoose.model('User',userSchema);

class userModel
{
  register(data, cb)
  {
    user.create(data, (err)=>
    {
      if(err)
      {
        cb(false,{error: "Couldn't add user"});
        console.log(err);
      }else
        {
          cb(true,{error: "User added"});
        }

    });
  }

  get(who,cb)
  {
    user.findOne({nick: who.nick}, (err,data)=>
    {
      if(err) cb(false);
      else cb(true,data);
    });
  }

  getAll(cb)
  {
    user.find({},(err,data)=>
    {
      if(err) cb(false);
      else cb(true,data);
    });
  }
}

module.exports = userModel;
