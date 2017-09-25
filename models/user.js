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
    console.log("I'm on the prev save function");
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

const user = mongoose.model('User',userSchema);

class userActions
{
    registerUser(newUser, cb) /*cb=callback*/
    {        
        newUser.save((err)=>
        {
            if(err) 
                return cb(false,{error: "Couldn't add user: "+err});
            else 
                return cb(true,{message: "User added"});
            
        });
    }

    passUser(who, cb)
    {
        user.findOne({email: who.email},{password:1},(err,user)=>
        {            
            if(err) return cb(false,{error: err});
            if(!user)  return cb(false,{error: "User doesn't exists"});
                     
            user.pass(who.password,(ok,message)=>
            {               
                if(ok) return cb(true,{message: "Logged in: "+who.email});             
                                    
                return cb(false, {error:"Password is incorrect"});               
            });        
            
        });
    }
    
    getUser(query,cb)
    {
        user.findOne(query, (err,user)=>
        {
            if(err) return cb(false, {error: err});
            if(!user)  return cb(false, {error: "The user doesn't exists"});
                     
            return cb(true,user);
        });
    }

    getAllUsers(cb)
    {
        user.find({},(err,data)=>
        {
            if(err) cb(false);
            else cb(true,data);
        });
    }
}

module.exports = {userActions,user};
