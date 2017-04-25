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
var admin_key = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC+4iHGFhIpytaf\nCywS9vBp32hantjnLMrmJ5xE0SoU0RmZnZf7LevQQgrEZG6b1h1nN+PoeJaUSNoT\nyI7BfpO42KuWaohGKtuIuPXR82SVVY265b1y7IUtgwfG7zg4Gnu52CAp707nYXP4\ngg71sW5LaWA4hHEzeSbf6a/WmHRDy0eVgi+eaKbjEQODns1bO7znyBVEv5vxRggm\nc2+E9UBBiroxTKJJy05XeZq3AQEkngFa5jip0d61WrpOdLI1PGRJ1PU/gIPSuJK+\nY0wzFzq0WS6rE8nrv2rCeqCYynyNUUqvtekBXo4qyx+LGfK+kIZ9kqje/tNLaAED\nm1RuswRDAgMBAAECggEBAJa8aiFMApHgLPWxU9+yA44HrxeIww5jT+LKOtwZNJr1\nuLqXOZJP5B00Wd5W1QXY4qVE/IPy3i5BDX177kecljjtWSrR+8U1SOHB9dUS2EYZ\nJnAFxkI/xrd29qhA9mtPdo7+vf9/jBap3XPL+NZKhCenEiXvaJlWPb2qg4H6KC3z\ntp6e92AuuS1zVc4qxKhtbcR9zQqcE+rGR1k97merHrim9ClV3Vzw3Plq68bMDWrY\nENADnW1Zt9yPzlHYsfI5XpfahZBhcWfZmlKbK8oNswEn0EmqTd+I/QbtZzq+Jfn9\nuKRBb6ZmsOR8pPDESVhvzrE0pxAUdKw5Wp+TFp2WyGkCgYEA5v0KwzS4+c59CYfB\nxAIrAMjLwrfCL7kBUJAhcoWfHFEOm9NC6EEDHu7IU8bfjHrZjsI3YR7whvwqhEJY\nJzDRAPypLqiLPACIVGOPsF5bM4szhr2zTL0Tg/o2DSfteggvVEg2gQzQbEAi67w/\nwqdAGT9FEx9sKyQorlFdPKCILM0CgYEA041iHl11M2xqr6n+q0w5QFLT7lnWOnpQ\naQSoOoPVMjYdSe4tEkrCHHjafG08PYd3J3jwTsPVmTRp/2EnJQJqIJ7brweWLIEu\n7o+Cljr5CKU6U1Qeh1pvO+N1Ac7e/qvBywXgbbqPVULcluQK07NJ692dmrYIh6u2\nJTpLZfkB9U8CgYAyHZaXMbosYNOaHL06lKnV2rryvUHBbudNHmhTW5Bg6Wk8/8IV\nd/2AWZhXLN/Vr9XB9ntjc/4Fm3JyDZ7oqdu+1hKyz9idpRPvE0baoi4xabM9Oa1M\nKf2w9bmCczY/8sSqCZzhtPEHe4bYFJjU18q9b4/CDWA/n/G/mGGdRMsmxQKBgG65\n64c1J2jY8CYtdcw2wyh1sdNpVgWZi4jMFTk7U1VKmZ3eedy/IEZCwyipDASwaJ9S\nX4T6X0wm8Ovn79MhJmcYfqdn8yQsIWJf3tu+1iW+RX7j4m652MqhzNY7buAhCfe3\nhbYpFWhs7IRVq40OpDw97IXTjTdlmpp1no0q/ellAoGAPCug1CvP80Pa3JIdOvwQ\neQuqnqmyqlGzPVnVteUAe8cU/j6FWsj9Kn4XywiaQHlLCp/2BxzSdh8EFVMb99Zr\nbXxOsWpawOKAAUuZM0HWcujPp5XlttmY4odpKZLhar+Dl5OibmcejR/5RMYR4786\netn0bpi/JGM7OCtb5OOgpD0="

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