// /models/userSchema.js

// Modules
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// Create MongoDB Schema
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    passwordConf: {
        type: String,
        required: true
    },
    wins: Number,
    losses: Number,
    draws: Number
});

// pre-save action
UserSchema.pre('save', function(next){
    var user = this;
    //Encrypt password
    bcrypt.hash(user.password, 10, function(err, hash){
        if(err) {
            return next(err)
        }
        // Override the passwordand passwordConf that will be saved with the hashed version
        user.password = hash;
        user.passwordConf = hash;
        next();
    })
});

//Authenticate input against database
UserSchema.statics.authenticate = function(username, password, callback){
    //find user in database using username as search term
    User.findOne({ username: username }, function(err, data){
        //if error occured
        if(err){
            return callback(err);
        } else if(!data){
            //if no record found, create new error (in this way the error will be handled properly)
            var err = new Error('No user found');
            err.status = 401;
            return callback(err)
        }
        //If the above doesn't happen, do the below..
        //Compare input password and DB password
        bcrypt.compare(password, data.password, function(err, result){
            //if they match (could be without === true, but with passwords you want to be extra safe
            if(result === true){
                //as the function in login.js is (err, result), err is set to null and result set to data.
                return callback(null, data);
            } else {
                var err = new Error('Password incorrect');
                err.status = 401;
                return callback(err);
            }
        })
    })
};

var User = mongoose.model('User', UserSchema);
module.exports = User;
