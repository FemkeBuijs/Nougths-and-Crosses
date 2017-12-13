var express = require('express');
var router = express.Router();
var path = require('path');
var User = require('../models/userSchema.js');

router.get('/', function(req, res, next){
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.post('/', function(req, res, next){
    //if all fields set
    if(req.body.username && req.body.password && req.body.submit) {
        var userData = {
            username: req.body.username,
            password: req.body.password
        };
        User.authenticate(userData.username, userData.password, function(err, data){
            if(err){
                return err
            }
            //Override session info
            req.session.userId = data._id;
            req.session.loggedIn = true;

            //Redirect to secure page
            res.redirect('/');
        })
    }
});

module.exports = router;