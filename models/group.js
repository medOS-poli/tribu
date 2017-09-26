"use strict";

const mongoose = require('./db'),
    GroupModel = require('./Group'),
    userModel = require('./user');
    
const schema = mongoose.Schema;
const User = new userModel.userActions();
const Group = new GroupModel.GroupActions();

const groupObject =
{
    community: {type: schema.Types.ObjectId, ref: 'Communities' },
    name : {type:String, required:true, unique:true },
    title : {type: String, required:true},
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
        
    }
}

module.exports = {groupActions,group};
