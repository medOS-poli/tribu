"use strict";

const mongoose = require('./db'),
    communityModel = require('./community'),
    userModel = require('./user');
    
const schema = mongoose.Schema;
const User = new userModel.userActions();
const Community = new communityModel.communityActions();

const groupObject =
{
    community: {type: schema.Types.ObjectId, ref: 'Communities' },
    title : {type:String, required:true, unique:true },
    description : String, 
    user_moderator: {type: schema.Types.ObjectId, ref: 'Communities.users' },
    users: [{type: schema.Types.ObjectId, ref: 'Communities.users'}],
    creationDate: {type: Date, default: Date.now()}    
};

const groupSchema = new schema(groupObject,{collection : "Groups"});

const group = mongoose.model('Group',groupSchema);

class groupActions
{  
    registerGroup(newGroup, cb)
    {
        newGroup.save(err =>
        {
            if(err) return cb(false,{error:"Error saving group"+err});
            return cb(true,{message:"Group saved"});            
        });
    }
}

module.exports = {groupActions,group};
