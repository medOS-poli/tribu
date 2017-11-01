'use strict';
const hat = require('hat');

const mongoose = require('./db'),
      userModel = require('./user');
    
const schema = mongoose.Schema;
const user = new userModel.UserActions();

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
    users: [ {_id:false,  id: {type: schema.Types.ObjectId, ref: 'Users'}, type: {type:String, required:true, enum:['ADMIN','MODER','USER'], default:'USER'} }],
    creationDate: {type: Date, default: Date.now()},
    privacy: {type:String, enum:['PRIVATE','PUBLIC','OPEN'], default: 'OPEN', require: true},
    requests: [{type: schema.Types.ObjectId, ref: 'Users'}],
    secret: {type: String, require: true, unique: true, select:false }    
};

const communitySchema = new schema(communityObject,{collection : "Communities"});

const community = mongoose.model('Community',communitySchema);

class CommunityActions
{  
    registerCommunity(newCommunity, cb)
    {
        this.getCommunity({name:newCommunity.name},(ok,msgCommunity)=>
        {
            if(ok) return cb(false, {error:"Community already exists"});            

            user.getUser({_id:newCommunity.creator}, (ok,msg)=>
            {
                if(ok)
                {
                    user.getUsersIds(newCommunity.user_admin,(admins)=>
                    {
                        newCommunity.user_admin = admins;
                        newCommunity.user_admin.push(newCommunity.creator);                        
                        newCommunity.users.push({id: newCommunity.creator, type: 'ADMIN'});
                        
                        user.getUsersIds(newCommunity.user_moderator,(moderators)=>
                        {
                            newCommunity.user_moderator = moderators;
                            newCommunity.user_moderator.push(newCommunity.creator);                       
                            newCommunity.users.push({id: newCommunity.creator, type: 'MODER'});
                            
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

    getCommunity(query, cb)
    {
        community.findOne(query, (err, community) =>
        {
            if(err) return cb(false, {status: 500, error: err});
            if(!community)  return cb(false, {status: 404, error: "The community doesn't exists"});
                     
            return cb(true, community);
        });
    }
    
    getCommunities(query, exclude, cb)
    {        
        community.find(query, exclude, (err, communities) =>
        {
            if(err) return cb(false, {status:500, error: err});
            if(!communities)  return cb(false, {status: 404, error: "The community doesn't exists"});
                     
            return cb(true, communities);
        });       
    }

    registerRequest(query,update,cb)
    {
        community.update(query,update,(err,updated)=>
        {
            if(err) return cb(false, {error:err});
            return cb(true, {message:"User added"});
        });
    }

    updateCommunity(query, cb)  
    {
        community.update(query, (err) => 
        {
            if(err) return cb(false, { error: err });
            return cb(true, { message: "Community updated" });
        })
    }

    deleteCommunity(query, cb) 
    {
        community.remove(query, (err, remove) => 
        {
            (err) ? cb(false, { error: err} ) : cb(true, { message: "Community deleted" });
        });
    }    

    getUsers(communityName, query, cb)
    {          
        community.aggregate([{$match: communityName },{$unwind:"$users"},{$lookup: {from: "Users", localField: "users.id", foreignField: "_id", as:"communityUsers"}},{$project: {type: "$users.type", user: "$communityUsers"} },{$match: query}, {$project: {"user.password":0}}],(err, communityUsers) =>
        {
            if (err) return cb(false, { status: 500, error: err })
            if (!communityUsers || communityUsers.length<1) return cb(false, {status: 418, error: "Not users found"})
            
            return cb(true,communityUsers)
        });
    }
}



/*
db.Communities.aggregate([{$match: {$and: [{name: "medos"}, { users: { $elemMatch: { type: "ADMIN" } } } ]}},{$lookup: {from: "Users", localField: "users.id", foreignField: "_id", as:"communityUsers"}},{$project:{ communityUsers:1}}]).pretty()

db.Communities.aggregate([{$match: {name: "medos"}},{$lookup: {from: "Users", localField: "users.id", foreignField: "_id", as:"communityUsers"}} ,{$project:{ communityUsers:1}}]).pretty()


db.Communities.aggregate([{$match: {name: "medos"}},{$unwind:"$users"},{$lookup: {from: "Users", localField: "users.id", foreignField: "_id", as:"communityUsers"}},{$project: {type: $type, user: $communityUsers} }]).pretty()*/

// aggregate([{$match: {name: "medos"}},{$lookup: {from: "Users", localField: "users.id", foreignField: "_id", as:"communityUsers"}}, {$unwind: "$communityUsers"  }, { $project : { _id : 1}}]).pretty()

module.exports = {CommunityActions,community};
