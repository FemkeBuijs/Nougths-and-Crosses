var express = require('express');
var router = express.Router();
var path = require('path');
var User = require('../models/userSchema.js');

var app = express();

app.get('/', function(req, res, next){
    res.sendFile(path.join(__dirname, '../views/register.html'));
});

router.post('/', function(req, res, next){
    //if all fields set
    if(req.body.username && req.body.password && req.body.passwordConf && req.body.submit) {
        var userData = {
            username: req.body.username,
            password: req.body.password,
            passwordConf: req.body.passwordConf,
            wins: 0,
            losses: 0,
            draws: 0
        };
        if (userData.password === userData.passwordConf) {
            User.create(userData, function (err, data) {
                if (err) {
                    return next(err);
                } else {
                    //Change session to logged in (userId and loggedIn are created by us, it adds it to the session                    //in app.js)
                    req.session.userId = data._id;
                    req.session.loggedIn = true;
                    //Send page to /secure
                    return res.redirect('/secure');
                }
            })
        }
    }
});

module.exports = router;