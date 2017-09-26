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
    users: [{type: schema.Types.ObjectId, ref: 'Users'}],
    //users: [{user_id:{type: schema.Types.ObjectId, ref: 'Users'},date:Date.now()}],
    creationDate: {type: Date, default: Date.now()},
    privacy: {type:String, enum:['PRIVATE','PUBLIC','OPEN'], default: 'OPEN', require: true},
    requests: [{type: schema.Types.ObjectId, ref: 'Users'}]
    
};

const communitySchema = new schema(communityObject,{collection : "Communities"});

const community = mongoose.model('Community',communitySchema);

class communityActions
{  
    registerCommunity(newCommunity, cb)
    {
        this.getCommunity({name:newCommunity.name},(ok,msgCommunity)=>
        {
            if(ok) return cb(false, {error:"Community already exists"});            
            console.log("NEWCOMMUNITY>>",newCommunity);           
            
            User.getUser({_id:newCommunity.creator}, (ok,msg)=>
            {
                if(ok)
                {
                    User.getUsersIds(newCommunity.user_admin,(admins)=>
                    {
                        newCommunity.user_admin = admins;
                        newCommunity.user_admin.push(newCommunity.creator);
                        
                        User.getUsersIds(newCommunity.user_moderator,(moderators)=>
                        {
                            newCommunity.user_moderator = moderators;
                            newCommunity.user_moderator.push(newCommunity.creator); 
                            
                            community.create(newCommunity,(err)=>
                            {
                                if(err) 
                                    return cb(false,{ error:"Couln't register new community: "+err});
                                else return cb(true,{message: "Community registered! Yay!"});
                            });
                            
                        });                        
                        
                    });                    
                }else return cb(false,msg);                    
            });        
        });
    }

        
    generateCommunityToken(data)
    {
        let token = hat();
        return data+token.slice(0,4);
    }

    registerUser(query,update,cb)
    {
        community.update(query,update,(err,updated)=>
        {
            if(err) return cb(false, {error:err});
            return cb(true,{message:"User added"});
        });
    }

    getCommunity(query,cb)
    {
        community.findOne(query, (err,community)=>
        {
            if(err) return cb(false, {error: err});
            if(!community)  return cb(false, {error: "The community doesn't exists"});
                     
            return cb(true,community);
        });
    }

    registerRequest(query,update,cb)
    {
        community.update(query,update,(err,updated)=>
        {
            if(err) return cb(false, {error:err});
            return cb(true,{message:"User added"});
        });
    }

}

module.exports = {communityActions,community};
