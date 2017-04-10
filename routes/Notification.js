/**
 * Created by KD on 3/2/2017.
 */
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = process.env.MONGO_URL;

var FCM = require('fcm-push');
var serverKey = process.env.FCM_SERVER_KEY;
var fcm = new FCM(serverKey);

var admin = require("firebase-admin");
var serviceAccount = require(__dirname+"/hungry-me-e36d3-firebase-adminsdk-90xb4-a59e713bf3.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://hungry-me-e36d3.firebaseio.com"
});

var inserthappyhour = function (req,res,next){
    req.body.username = req.params.username;
    req.body.published = "false";
    happyhour = req.body;

    MongoClient.connect(url, function (err, db) {
        db.collection('happyhour').insertOne(happyhour).then(function (success) {
            db.close();
            next();
        }, function (err) {
            err = new Error("Could Not add happyhour to DB")
            err.status=400;
            db.close();
            next(err);
        });
    });
}


router.post("/hotels/:username/happy_hour", inserthappyhour , function sendNotification(req,res,next){
        var message = {
            to: '/topics/'+req.params.username, // required fill with device token or topics
            data:{
                hotelname: req.body.hotelname,
                message: req.body.message,
                start_time: req.body.start_time,
                end_time: req.body.end_time,
                username: req.params.username
            },
            notification: {
                title: req.body.hotelname,
                body: req.body.message
            }
        };

        //promise style
        fcm.send(message)
            .then(function(response){
                console.log("Successfully sent with response: ", response);
                res.status(201);
                res.json({"result":true});
            })
            .catch(function(err){
                console.log("Something has gone wrong!");
                console.error(err);
                next(err);
            })
});


var addFavoriteHotel = function (req,res,next){

    if (req.body.hotel == undefined || req.body.hotel == ""
        || req.body.registrationToken == undefined || req.body.registrationToken == "") {
        err = new Error("Hotel/ Registration Token cannot be empty");
        err.status = 400;
        next(err);
    }

    var appUser = req.params.username;
    var hotel = req.body.hotel;

    MongoClient.connect(url, function (err, db) {
        db.collection('User').update({
                "username": appUser,
            },
            {
                $addToSet: {favorite: hotel }
            }).then(function (success) {
            db.close();
            next();
        }, function (err) {
            err = new Error("Could Not add happyhour to DB")
            err.status=400;
            db.close();
            next(err);
        });
    });
}

var removeFavoriteHotel = function (req,res,next){

    if (req.body.hotel == undefined || req.body.hotel == ""
        || req.body.registrationToken == undefined || req.body.registrationToken == "") {
        err = new Error("Hotel/ Registration Token cannot be empty");
        err.status = 400;
        next(err);
    }

    var appUser = req.params.username;
    var hotel = req.body.hotel;

    MongoClient.connect(url, function (err, db) {
        db.collection('User').update(
            {"username": appUser},
            { $pull: { favorite: hotel } }
        ).then(function (success) {
            db.close();
            next();
        }, function (err) {
            err = new Error("Could not remove  hotel from DB")
            err.status=400;
            db.close();
            next(err);
        });
    });
}

var getUpdatedUser = function (req,res,next){
    var username = req.params.username;
    MongoClient.connect(url, function (err, db) {
        db.collection('User').findOne({"username":username})
            .then(function (success) {
                if(success == undefined)
                    success = {};
                db.close();
                req.appUser = success;
                next();
            }, function (err) {
                err = new Error("Server Error while searching for "+ username);
                err.status=500;
                db.close();
                next(err);
            });
    });
}

router.put("/app/users/:username/favorite", addFavoriteHotel , getUpdatedUser, function subscribeToFCM(req,res,next){

    // This registration token comes from the client FCM SDKs.
    var registrationToken = req.body.registrationToken;

    // The topic name can be optionally prefixed with "/topics/".
    var topic = "/topics/"+req.body.hotel.split("@")[0];

    // Subscribe the device corresponding to the registration token to the
    // topic.
    admin.messaging().subscribeToTopic(registrationToken, topic)
        .then(function(response) {
            // See the MessagingTopicManagementResponse reference documentation
            // for the contents of response.
            console.log("Successfully subscribed to topic:", response);
            res.status(200);
            res.json(req.appUser);
        })
        .catch(function(error) {
            console.log("Error subscribing to topic:", error);
        });
});

router.delete("/app/users/:username/favorite", removeFavoriteHotel , getUpdatedUser, function unsubscribeToFCM(req,res,next){

    // This registration token comes from the client FCM SDKs.
    var registrationToken = req.body.registrationToken;

    // The topic name can be optionally prefixed with "/topics/".
    var topic = "/topics/"+req.body.hotel.split("@")[0];

    // Subscribe the device corresponding to the registration token to the
    // topic.
    admin.messaging().unsubscribeFromTopic(registrationToken, topic)
        .then(function(response) {
            // See the MessagingTopicManagementResponse reference documentation
            // for the contents of response.
            console.log("Successfully unsubscribed from topic:", response);
            res.status(200);
            res.json(req.appUser);
        })
        .catch(function(error) {
            console.log("Error subscribing to topic:", error);
        });
});
module.exports = router;