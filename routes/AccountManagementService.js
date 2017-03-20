/**
 * Created by KD on 3/2/2017.
 */
var express = require('express');
var router = express.Router();

/*const monk = require('monk');
const url = 'mongodb://serteam6:hungryme123@ds153179.mlab.com:53179/hungryme';
const db = monk(url);*/


var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://serteam6:hungryme123@ds153179.mlab.com:53179/hungryme';

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a User resource');
});

//Add new App User to MongoDB
router.post('/app/users', function(req, res,next) {
    var new_user = req.body;
    console.log(new_user);
    if(new_user.username == undefined) {
        err = new Error("Request body is missing username parameter")
        err.status=400;
        next(err);
    }
    else {
        MongoClient.connect(url, function (err, db) {
            db.collection('User').insertOne(new_user).then(function (success) {
               db.close();
               res.status(201).end();
            }, function (err) {
                err = new Error("Username is already taken. Could Not add user to DB")
                err.status=400;
                db.close();
                next(err);
            });
        });
    }
});

//Get App User by username from MongoDB
router.get('/app/users/:username', function (req, res, next) {
    username = req.params.username;
    if (username == undefined) {
        err = new Error("Username cannot be empty");
        err.status = 400;
        next(err);
    }
    else {
        //call mongodb
        MongoClient.connect(url, function (err, db) {
            db.collection('User').findOne({"username":username}).then(function (success) {
                if(success == undefined)
                    success = {};
                db.close();
                res.status(200);
                res.json(success)
            }, function (err) {
                err = new Error("Server Error while searching for "+ username);
                err.status=500;
                db.close();
                next(err);
            });
        });
    }
});

// login App User
router.post('/app/login', function (req, res, next) {
    username = req.body.username;
    password = req.body.password;
    if (username == undefined || username == ""|| password == undefined || password == "") {
        err = new Error("Username/ Password cannot be empty");
        err.status = 400;
        next(err);
    }
    else {
        //call mongodb
        MongoClient.connect(url, function (err, db) {
            db.collection('User').findOne({"username":username}).then(function (success) {
                //console.log(success);

                if(success == undefined) {
                    //username not present
                    success ={"result" : false};
                    db.close();
                    res.status(401);
                    res.json(success)
                }
                else if( password !== success.password) {
                    //password does not match
                    success ={"result" : false};
                    db.close();
                    res.status(401);
                    res.json(success)
                }
                else {
                    //user authentication successful
                    success ={"result" : true};
                    db.close();
                    res.status(200);
                    res.json(success)
                }

            }, function (err) {
                err = new Error("Server Error while searching for "+ username);
                err.status=500;
                db.close();
                next(err);
            });
        });
    }
});


//Add new Hotel User to MongoDB
router.post('/hotel/users', function(req, res,next) {
    var hotelUser = req.body;
    console.log(hotelUser);
    if(hotelUser.username == undefined) {
        err = new Error("Request body is missing username parameter")
        err.status=400;
        next(err);
    }
    else {
        MongoClient.connect(url, function (err, db) {
            db.collection('User').insertOne(hotelUser).then(function (success) {
                db.close();
                res.status(201);
                res.json({"result":true});
            }, function (err) {
                err = new Error("Username is already taken. Could Not add user to DB")
                err.status=400;
                db.close();
                next(err);
            });
        });
    }
});


//Add new Hotel User to MongoDB
router.put('/hotel/users/:username', function(req, res,next) {
    var user = req.params.username;
    var newPassword = req.body.password;
    console.log("New User Details is :: " + newPassword);
    if(newPassword == undefined || newPassword == "") {
        err = new Error("Request body is missing required parameter")
        err.status=400;
        next(err);
    }
    else {
        MongoClient.connect(url, function (err, db) {
            db.collection('User').updateOne({ username: user },
                {
                    $set: {"password": newPassword}
                }).then(function (success) {
                db.close();
                res.status(200);
                res.json({"result":true});
            }, function (err) {
                err = new Error("password could not be set in DB")
                err.status=400;
                db.close();
                next(err);
            });
        });
    }
});


//Get Hotel User by username from MongoDB
router.get('/hotel/users/:username', function (req, res, next) {
    username = req.params.username;
    if (username == undefined) {
        err = new Error("Username cannot be empty");
        err.status = 400;
        next(err);
    }
    else {
        //call mongodb
        MongoClient.connect(url, function (err, db) {
            db.collection('User').findOne({"username":username}).then(function (success) {
                if(success == undefined)
                    success = {};
                db.close();
                res.status(200);
                res.json(success)
            }, function (err) {
                err = new Error("Server Error while searching for "+ username);
                err.status=500;
                db.close();
                next(err);
            });
        });
    }
});

module.exports = router;