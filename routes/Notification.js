/**
 * Created by KD on 3/2/2017.
 */
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = process.env.MONGO_URL;


router.post("/hotel/:username/happy_hour",function (req,res,next){
    req.body.username = req.params.username;
    req.body.published = false;
    happyhour = req.body;


    MongoClient.connect(url, function (err, db) {
        db.collection('happyhour').insertOne(happyhour).then(function (success) {
            db.close();
            res.status(201);
            res.json({"result":true});
        }, function (err) {
            err = new Error("Could Not add happyhour to DB")
            err.status=400;
            db.close();
            next(err);
        });
    });;

});

module.exports = router;