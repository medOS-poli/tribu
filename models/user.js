"use strict";

const bcrypt = require('bcrypt-nodejs'),
    mongoose = require('./db');
    
const schema = mongoose.Schema;
const ENCRYPT_SALT_VALUE = 10;

const userObject =
{
    email : {type: String, lowercase:true, unique:true, required:true},
    nick : {type: String, unique: true, required: true},
    name : {type: String, required:true},
    second_name : String,
    last_name : {type: String, required: true},
    second_last_name: String,
    password : {type: String, select: false},
    gender : {type:String, enum:['M','F','O'], default:'O'},
    avatar : String,
    singupDate : {type: Date, default: Date.now()},
    lastLogin : Date,
    tags : [String]
};

const userSchema = new schema(userObject,{collection : "Users"});

userSchema.methods.pass = function(pass,cb)
{    
    bcrypt.compare(pass, this.password, (err, isMatch)=>
    {
        if (err) return cb(false,{error:"Password is incorrect"});
        return cb(isMatch,{match: isMatch});
    });
}

var hashPasswordSave = function(next) 
{
    var user = this;    
    if (!this.isModified('password')) return next();    
    bcrypt.genSalt(ENCRYPT_SALT_VALUE, (err,salt) =>
    {
        if(err) return next(err);
                    
        bcrypt.hash(user.password,salt,null,(err,hash)=>
        {
            if(err) return next(err);
            user.password = hash;
            return next();
        });
    });
};

userSchema.pre('save',hashPasswordSave);

const user = mongoose.model('User', userSchema);

class UserActions
{
    registerUser(newUser, cb) 
    {        
        newUser.save((err) =>
        {
            if(err) return cb(false, {error: "Couldn't add user: " + err});
            return cb(true, {message: "User added"});
        });
    }

    passUser(who, cb)
    {
        user.findOne({$or:[{email: who.email},{nick: who.nick}]}, {password:1, email:1, nick:1}, (err,user) => //=> function
        {            
            if(err) return cb(false,{status: 500, error: err});
            if(!user)  return cb(false, {status: 404, error: "User doesn't exists"});
                     
            user.pass(who.password, (ok,message) =>
            {               
                if(ok) return cb(true, user);                                  
                return cb(false, {status: 401, error:"Password is incorrect"});               
            });                  
        });
    }
    
    getUser(query, cb)
    {
        user.findOne(query, (err, user) =>
        {
            if(err) return cb(false, {error: err});
            if(!user) return cb(false, {error: "The user doesn't exists"});        
            return cb(true, user);
        });
    }
    
    getUsers(query, cb)
    {
        user.find(query, (err, users) =>
        {
            if(err) return cb(false, {status: 500, error: err});
            if(!users)  return cb(false, {status: 404, error: "The user doesn't exists"});
                     
            return cb(true, users); 
        });
    }

    getAllUsers(cb)
    {
        user.find({},(err, users) =>
        {
            if(err) return cb(false, {error: err});
            if(!user) return cb(false, {error: "There are no users"});

            return cb(true, users);
        });
    }
    
    getUsersIds(users,cb)
    {
        var usersIds = [];
        if (typeof users !== 'undefined' && users.length > 0) 
        {          
            var onComplete = function()
            {
                cb(usersIds);
            };
            var tasksToGo = users.length;        
            if (tasksToGo === 0) onComplete();
            else 
            {
                users.forEach((user)=>
                {                   
                    this.getUser({$or:[{email:user},{nick:user}]}, (ok,msgUser)=>
                    {
                        if(ok) usersIds.push(msgUser._id);                       
                        if (--tasksToGo === 0) onComplete();                    
                    }); 
                });
            }  
        } else return cb(usersIds)  
    }

    updateUser(query, update, cb)
    {
        user.update(query, update, (err, update) => 
        {
            if(err) return cb(false, {error:err});
            return cb(true,{message:"User updated"});
        })
    }
}

module.exports = {UserActions,user};
