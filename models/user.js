const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name:{
        type:String,
        maxlength:50
    },
    email:{
        type:String,
        trim:true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname:{
        type:String,
        maxlength:50
    },
    role: {
        type:Number,
        default: 0
    },
    token : {
        type: String
    },
    tokenExp:{
        type:Number
    }
})

//before saving you want to hash
userSchema.pre('save', function( next ) {
    var user = this;
    //process happens only when modifying password
    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, function(err, salt){
            //next means you go instantly to save aka user.save() in index.js
            if(err) return next(err);
    
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash;
                next();
            })
        }) 
    } else {
        next();
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    bcrypt.compare(plainPassword,this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;
    var token = jwt.sign(user._id.toHexString(),'secret')

    user.token = token;
    user.save(function(err, user){
        if(err) return cb(err);
        cb(null, user);
    })
}

userSchema.static.findByToken = function(token, cb) {
    var user = this;

    jwt.verify(token, 'secret', function(err, decode){
        user.findOne({"_id":decode, "token":token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = { User }