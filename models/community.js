"use strict";
const hat = require('hat');

const mongoose = require('./db'),
    userModel = require('./user');
    
const schema = mongoose.Schema;
const User = new userModel.userActions();

const communityObject =
{
    name : {type:String, required:true, unique:true },
    title : {type: String, required:true},
    description : String,
    logo : String,
    creator: {type: schema.Types.ObjectId, ref: 'Users', require: true},
    inv_token : {type: String, unique:true, required:true},
    user_admin: [{type: schema.Types.ObjectId, ref: 'Users', require: true }],
    user_moderator: [{type: schema.Types.ObjectId, ref: 'Users' }],
    users: [{type: schema.Types.ObjectId, ref: 'Users' }],
    creationDate: {type: Date, default: Date.now()},
    privacy: {type:String, enum:['PRIVATE','PUBLIC'], default: 'PUBLIC', require: true},
    requests: {
        users: [{type: schema.Types.ObjectId, ref: 'Users'}]
    }
};

const communitySchema = new schema(communityObject,{collection : "Communities"});

const community = mongoose.model('Community',communitySchema);

class communityActions
{  
    registerCommunity(newCommunity, cb)
    {
        console.log("NEWCOMMUNITY>>"+newCommunity);
        User.getUser({$or:[{email:newCommunity.creator},{nick:newCommunity.creator}]}, (ok,msg)=>
        {
            if(ok)
            {
                newCommunity.creator= msg._id;
                newCommunity.user_admin= [msg._id];
                newCommunity.user_moderator= [msg._id];
                community.create(newCommunity,(err)=>
                {
                    if(err) 
                        return cb(false,{ error:"Couln't register new community: "+err});
                    else return cb(true,{message: "Community registered! Yay!"});
                });
            }else return cb(false,msg);                    
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

module.exports = {communityActions,community};
