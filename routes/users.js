/* created by nghiatq on 12-10-2019 */

var express = require('express');
var userModel = require('../models/users.model');
var passport = require('passport');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var router = express.Router();

// test loading database
router.post('/', (req, res, next) => {
    userModel.all().then(rows => {
        res.status(200).json({
            message: 'Connect database successful'
        });
    }).catch(err => {
        res.status(400).json({
            message: 'Connect database fail'
        });
    });
});

// register a new user
router.post('/register', (req, res, next) => {

    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var fullname = req.body.fullname;

    // check params
    if (!username || !password || !email || !fullname) {
        res.status(400).json({
            message: 'Please input all fields'
        });
    }
    else {
        // hash password
        var saltRounds = 10;
        var hash = bcrypt.hashSync(password, saltRounds);

        // create an entity
        var entity = {
            username: username,
            password: hash,
            email: email,
            fullname: fullname
        }

        // add to database
        userModel.add(entity).then(id => {
            res.status(200).json({
                message: 'Register success'
            });
        }).catch(err => {
            res.status(400).json({
                message: err
            });
        })
    }
});

// login with username & password
router.post('/login', (req, res, next) => {

    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json({
                message: info.message,
            });
        }
        req.login(user, {session: false}, (err) => {
            if (err) {
                res.status(400).json({
                    message: err
                });
            }

            // generate a signed son web token with the contents of user object and return it in the response
            const token = jwt.sign(JSON.stringify(user), 'nghiatq_jwt_secretkey');
            return res.json({
                user,
                token
            });
        });
    })(req, res);
});

module.exports = router;