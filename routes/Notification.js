/**
 * Created by KD on 3/2/2017.
 */
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = process.env.MONGO_URL;
var fcm_admin = require("firebase-admin");
var FCM = require('fcm-push');
var serverKey = 'AAAA5HSMyZ0:APA91bG7QQTpkBdbrlcmg2jyboI9muSY1xT4ExdlyC4I32-Vl3GQc0MKag2Z2dcyLgOyeyoESInqY2XVWuF6YxZAtfGphfIZhdZUz2yR22atMwkpcIUl2qgmngLDEVpGcNs60DXMcB32';
var fcm = new FCM(serverKey);

router.post("/hotel/:username/happy_hour",
    function (req,res,next){
    req.body.username = req.params.username;
    req.body.published = "false";
    happyhour = req.body;


    MongoClient.connect(url, function (err, db) {
        db.collection('happyhour').insertOne(happyhour).then(function (success) {
            db.close();
            //res.status(201);
            //res.json({"result":true});
            next();
        }, function (err) {
            err = new Error("Could Not add happyhour to DB")
            err.status=400;
            db.close();
            next(err);
        });
    });

}, function sendNotification(req,res,next){
       /* /!*fcm_admin.initializeApp({
            credential: fcm_admin.credential.cert({
                projectId: process.env.GOOG_PRJ_ID,
                clientEmail: process.env.GOOG_FCM_CLIENT,
                privateKey: process.env.GOOG_FCM_PRV_KEY
            }),
            databaseURL: process.env.GOOG_FCM_DB_URL
        });*!/

        var serviceAccount = require(__dirname+"/hungry-me-e36d3-firebase-adminsdk-90xb4-55f746e39f.json");

        /!*fcm_admin.initializeApp({
            credential: fcm_admin.credential.cert(serviceAccount),
            databaseURL: "https://hungry-me-e36d3.firebaseio.com"
        });*!/

        fcm_admin.initializeApp({
            credential: fcm_admin.credential.refreshToken("AAAA5HSMyZ0:APA91bG7QQTpkBdbrlcmg2jyboI9muSY1xT4ExdlyC4I32-Vl3GQc0MKag2Z2dcyLgOyeyoESInqY2XVWuF6YxZAtfGphfIZhdZUz2yR22atMwkpcIUl2qgmngLDEVpGcNs60DXMcB32"),
            databaseURL: "https://hungry-me-e36d3.firebaseio.com"
        });

        // The topic name can be optionally prefixed with "/topics/".
        var topic = req.params.username;

        // See the "Defining the message payload" section below for details
        // on how to define a message payload.
        var payload = {
            data:{
                hotelname: req.body.hotelname,
                message: req.body.message,
                start_time: req.body.start_time,
                end_time: req.body.end_time,
                username: req.params.username
            }
        };*/

       /* // Send a message to devices subscribed to the provided topic.
        fcm_admin.messaging().sendToTopic(topic, payload)
            .then(function(response) {
                // See the MessagingTopicResponse reference documentation for the
                // contents of response.
                console.log("Successfully sent message:", response);
                res.status(201);
                res.json({"result":true});
            })
            .catch(function(error) {
                console.log("Error sending message:", error);
            });*/

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

module.exports = router;