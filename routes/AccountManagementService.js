/**
 * Created by KD on 3/2/2017.
 */
var express = require('express');
var router = express.Router();

//to procure placeID for hotels
var googleMapsClient = require('@google/maps').createClient({
    key: process.env.GEOCODE_API
});


// Dependencies to generate and send email for password reset for hotel user
var nodemailer = require('nodemailer');
var uuidV4 = require('uuid/v4');

const path = require('path');

// Mongo libraries to connect to MongoLabs
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectIDa;
var url = process.env.MONGO_URL;

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a User resource');
});

/* Add new App User to MongoDB. */
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

/* Get App User by username from MongoDB. */
router.get('/app/users/:username', function (req, res, next) {
    var username = req.params.username;
    MongoClient.connect(url, function (err, db) {
        db.collection('User').findOne({"username":username})
            .then(function (success) {
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
});

/* Update Password for App User to MongoDB. */
router.put('/app/users/:username', function(req, res,next) {
    var user = req.params.username;
    var newPassword = req.body.password;

    //console.log("New User Details is :: " + newPassword);
    if(newPassword == undefined || newPassword == "") {
        err = new Error("Request body is missing password parameter")
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
                err.status=500;
                db.close();
                next(err);
            });
        });
    }
});

/* Login App User. */
router.get('/app/login', function (req, res, next) {
    username = req.query.username;
    password = req.query.password;
    if (username == undefined || username == ""|| password == undefined || password == "") {
        err = new Error("Username/ Password cannot be empty");
        err.status = 400;
        next(err);
    }
    else {
        //call mongodb
        MongoClient.connect(url, function (err, db) {
            db.collection('User').findOne({"username":username}).then(function (success) {
                if(success == undefined) {
                    //username not present
                    success ={
                        "result" : false,
                        "message": "Username does not exist"
                    };
                    db.close();
                    res.status(401);
                    res.json(success)
                }
                else if( password !== success.password) {
                    //password does not match
                    success ={
                        "result" : false,
                        "message": "Password does not match with system"
                    };
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

/* Middleware : Gets PlaceID from google API for new hotel.
    * Uses Google PlaceAutoComplete API */
var getHotelPlaceID = function(req, res, next){
    //console.log(req.body.address);
    if(req.body.address == undefined || req.body.address == ""
        || req.body.hotelname == undefined || req.body.hotelname == "") {
        err = new Error("Hotel Address / Hotel Name cannot be empty");
        err.status = 400;
        next(err);
    }
    else {
        googleMapsClient.placesAutoComplete({
            input: req.body.hotelname + ',' + req.body.address,
            type: "establishment"
        }, function (err, response) {
            if (!err) {
                //console.log(response.json.results);
                if( response.json.status == "OK") {
                    req.body.place_id = response.json.predictions[0].place_id;
                    next();
                }
                else if(response.json.status == "ZERO_RESULTS") {
                    err = new Error("Hotel address could not be validated.");
                    err.status = 400;
                    next(err);
                }
                else {
                    console.log(response);
                    err = new Error("There was an error on the server.");
                    err.status = 503;
                    next(err);
                }
            }
            else {
                console.log(err);
                next(err);
            }
        });
    }

}

/* Add new Hotel User to MongoDB.
    * On POST request :
    * 1) get hotel's placeID
    * 2) add review parameters to recipes for new hotel
    * 3) persist Hotel in mongodb */
router.post('/hotel/users', getHotelPlaceID, function(req, res,next) {
    var hotelUser = req.body;
    console.log(hotelUser);
    if(hotelUser.username == undefined) {
        err = new Error("Request body is missing username parameter")
        err.status=400;
        next(err);
    }
    else if(hotelUser.place_id == undefined){
        err = new Error("Hotel missing placeID parameter. Something is wrong on server with Place verification module");
        err.status=500;
        next(err);
    }
    else{
        hotelUser.resetToken = "";
        if( hotelUser.menu !== undefined) {
            for (i = 0; i < hotelUser.menu.length; i++) {
                hotelUser.menu[i].count = 0;
                hotelUser.menu[i].review = 0;
                hotelUser.menu[i].comments = [];
            }
        }
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

/* Middleware: Generates a new password reset token and updatesDB with this token*/
var getResetToken = function getResetToken(req, res,next){
    var user = req.params.username;
    req.resetToken = uuidV4();

    console.log("New User Details is :: " + user);
    console.log("New User Details is :: " + req.resetToken);

    MongoClient.connect(url, function (err, db) {
        db.collection('User').update({ username: user },
            {
                $set: {"resetToken": req.resetToken}
            }).then(function (success) {
            db.close();
            next();
        }, function (err) {
            err = new Error("Token could not be set in DB")
            err.status=400;
            console.log(err);
            db.close();
            next(err);
        });
    });
}

/*Send Email with reset password link
    *On POST:
      * 1) Get a new password reset token for this user account
      * 2) Send an Email to the user. Email will contain the password reset link */
router.post('/hotel/users/:username/email', getResetToken, function sendEmail(req, res,next) {
    var user = req.params.username;

    //console.log("New User Details is :: " + user);
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.TEAM_MAIL,
            pass: process.env.TEAM_PASS
        }
    });

    var mailOptions = {
        from: process.env.TEAM_MAIL, // sender address
        to: user, // list of receivers
        subject: 'Password reset for HungryMe', // Subject line
        text: "Please click on below link to reset password",
        html: '<h1>Please click on below link to reset password</h1><br><br>'+
        '<a href=\'http://'+req.headers.host+'/hotel/users/'+user+'/resetpassword/'+ req.resetToken+'\'>' +
        '   <h2>Change Password</h2></a>'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            res.json({
                result: false,
                message: "Error Sending Email"
            });
        }else {
            console.log('Message sent: ' + info.response);
            res.json({result: true});
        };
    });

});

/* Validate password reset token and render password update page. */
router.get('/hotel/users/:username/resetpassword/:resetToken', function (req, res, next) {
    username = req.params.username;
    usertoken = req.params.resetToken;
    if (username == undefined || username == ""|| usertoken == undefined || usertoken == "") {
        err = new Error("Username/ Token cannot be empty");
        err.status = 400;
        next(err);
    }
    else {
        //validate token with DB
        MongoClient.connect(url, function (err, db) {
            db.collection('User').findOne({"username":username}).then(function (success) {
                console.log(success);

                if(success == undefined) {
                    //username not present
                    db.close();
                    res.status(401);
                    res.send("Token mismatch. Cannot reset password.")
                }
                else if( usertoken !== success.resetToken) {
                    //token does not match
                    db.close();
                    res.status(401);
                    res.send("Token mismatch. Cannot reset password.")
                }
                else {
                    //user authentication successful
                    db.close();
                    //res.redirect("http://"+ req.headers.host+"/UpdatePassword.ejs")
                    res.render('UpdatePassword', { user: username, host:req.headers.host}, function(err, html) {
                        res.send(html);
                    });
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

//Update Password for Hotel User to MongoDB
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
                    $set: {"password": newPassword,"resetToken":""}
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

/* Get Hotel User by username from MongoDB. */
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