var express = require('express');
var router = express.Router();
var path = require('path');
var User = require('../models/userSchema.js');

router.get('/', function(req, res, next){
    if(req.session){
        req.session.destroy(function(err){
            if(err){
                return err;
            } else {
                return res.redirect('/login');
            }
        })
    }
});

module.exports = router;