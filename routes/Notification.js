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
var admin_key = "MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDH9svovXQj2oPB\nitgnlJT8nrurtR8uUKuqT85gXTdUY0RLl2wQNaLYJCf+A/yqXKfg6lT1w8u6spDd\nC7ktqtt0BHW42B5y/ROOLdlgKD8KdpGWbCsFyKtR22KRYDa5+ijCJDH/LyxiJmUW\njH1wUc75KTaQAslAQYsYycO4P+kZJ/2T7n8FkF9wjGZQEZ0cfKQrhsL4csQ2XVM1\nuI9i/VNmme3ih9FdHHTOpaZpt0SI5Httz/xuBxHkh4n2Um/kT4cFy7BY5VTTsBbM\nx5V/BB1jpKi9iKHismMoEXHvxBG5QWoH7oaP0YdYHMrY4VeJsysLvoWPU4BR2PV8\noG6EF2MdAgMBAAECggEBAI/fGO02yoY1ZVDuhgFMXTm5N4wef/XB4xFh5DnfN70G\nww+kPgMXpDfhI8kWs0cb7UndMA23tzB349S256Bc6xJ5Vv4MuTPAtL46bMlLi7gK\ngUt6PiYmMGVv9GZmlFmRDJxKkJJrLYLc3ySvJl2W7tTEe1Z4OrZ5sgu+t4wsp5kJ\nrz+Y53SPkficHBP1ddyt35x3HCnJ6G13ROB5wHaNtO+fQiv2ydKzlJp1EjaXMOke\nPB2NH0F5xP2HZdBctVLV+3DMPWarv15pTRJuzvQo04g8MGcg05fRnPjDutl9X0YS\n2HiNhB1MzW8cmAA+F+ZCX2sPzcV6B5Pv0PqY8kFnfUECgYEA9SkFIPciB3O6nV1h\nKktKVjEUzmSVrGqVeQfqpZ8M7kTImuVqm2z3Y+mWaYTzUjKSpV9lKFs0UayF7L8i\nZw1i+sqWvrX7Xv7jNuaFPg8j1vVi8YG+dyJIDtvQd7Y/eyvUUopkNF33UlQ5h+Bp\n8+Bc6qSgyBoqmM0YcwLuqha55/ECgYEA0M4y43Kb+mYwDBsk7Rdliw9F1xp2Xfta\nNuYp2xrlhfRyAYdeA5XqcisaQV/ebV7dRXgAd597K8NMrOxh1nLj+qZ0p1mafmqk\nChn/3BTx1w05KVHWEFGv4K1NHRhGLRE+sQCgeUezHQNxQSymlB1Vl0nO+Z8ur6Rf\n40ev4lnHOe0CgYEAwUWPZ4es6hcQXZMKUN9+QSj8cCHX5U85e2sET4FuHkFXrNWE\nD/f9qGS0UYegk4KPHZRxGTmdq23JPvUH2Bozl+cypDKvcxqaYeOl02D4LjTRxfc1\nApKiICSm2llw/ld1UYUMrkQOAHepyzbeEIcmeU1D+7y1LDU0Oydqo+i6suECgYEA\nzcaH7BKkmO5f525Qw77M+XBBuayAfjoZPAUztpQZIhw2xj7rbckuVPkZVNfv0gUt\nNyr9+uWWcxhy1e/Ws4piFkA4sjvhvzfFFZdtySxy8SY88PWPamG2XEsttcCYWA2o\npLMjcqIwaCVeVYZ1W35VPVUlvmcbkUkCnm+lbAJiDjkCgYALzTECit6XNl7x8Oy0\nEeUXyTq20ClD3ROGPmBKfLYf3jQXkkb8Umze5frhZ9ts0b95p7CSGmYVIdVOkc73\nOr4FS+XzZDfu7rXqi1YDN+Nqb8brRKVwXqlwndUQdQT4bmlLaeexl84wXN45psed\nKaTYnxuzFaW/pWJfHDtTSVSlbQ=="

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.GOOG_PRJ_ID,
        clientEmail: process.env.GOOG_FCM_CLIENT,
        privateKey: "-----BEGIN PRIVATE KEY-----\n"+admin_key+"\n-----END PRIVATE KEY-----\n"
    }),
    databaseURL: process.env.GOOG_FCM_DB_URL
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

var getHotelUser = function (req,res,next){
    username = req.params.username;

    MongoClient.connect(url, function (err, db) {
        db.collection('User').findOne({"username":username}).then(function (success) {
            if(success == undefined)
                success = {};
            db.close();
            req.hotelUser =  success
            next();
        }, function (err) {
            err = new Error("Server Error while searching for "+ username);
            err.status=500;
            db.close();
            next(err);
        });
    });
}

router.post("/offers/:username/happy_hour", inserthappyhour , getHotelUser, function sendNotification(req,res,next){
    if(req.hotelUser == {}){
        err = new Error("Server Error while searching for "+ username);
        err.status=500;
        next(err);
    }

    var topic = "/topics/"+req.params.username.split("@")[0];

    var message = {
            to: topic, // required fill with device token or topics
            data:{
                hotelname: req.hotelUser.hotelname,
                hoteladdress: req.hotelUser.address,
                message: req.body.message,
                start_time: req.body.start_time,
                end_time: req.body.end_time,
                username: req.params.username
            },
            notification: {
                title: req.hotelUser.hotelname,
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
    console.log("######################"+req.body.hotel)
    console.log("######################"+req.body.registrationToken)
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
    console.log("######################"+req.query.hotel)
    console.log("######################"+req.query.registrationToken)
    if (req.query.hotel == undefined || req.query.hotel == ""
        || req.query.registrationToken == undefined || req.query.registrationToken == "") {
        err = new Error("Hotel/ Registration Token cannot be empty");
        err.status = 400;
        next(err);
    }

    var appUser = req.params.username;
    var hotel = req.query.hotel;

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

    console.log("User will be subscribed to :: " + topic)
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
    var registrationToken = req.query.registrationToken;

    // The topic name can be optionally prefixed with "/topics/".
    var topic = "/topics/"+req.query.hotel.split("@")[0];

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