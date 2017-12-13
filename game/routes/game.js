var express = require('express');
var router = express.Router();
var path = require('path');
var User = require('../models/userSchema.js');

router.get('/', requiresLogin, function(req, res, next){
    res.sendFile(path.join(__dirname, '../views/game.html'));
});

//checks if there is a user logged in
function requiresLogin(req, res, next){
    if(req.session && req.session.loggedIn){
        return next();
    }
    var err = new Error('You need to be logged in to play this game');
    err.status = 401;
    res.redirect('/login');
    return err;
}

module.exports = router;