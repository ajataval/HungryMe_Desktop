/**
 * Created by KD on 3/2/2017.
 */
var express = require('express');
var router = express.Router();
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const csv=require('csvtojson')
var fs = require('fs');
var googleMapsClient = require('@google/maps').createClient({
    key: process.env.GEOCODE_API
});


var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = process.env.MONGO_URL;

//Update menu for given hotel to MongoDB using file
router.post('/hotel/users/:username/uploadMenu', upload.single('foo'), function parseCSVtoJSON(req, res,next) {
    // next function in the process to update menu will be called after upload function from csv package uploads
    // file to temporary folder.
    console.log(req.file);

    req.newMenu = [];
    csvFilePath=req.file.path;
    csv()
        .fromFile(csvFilePath)
        // on event"json" i.e a row is read from csv and converted to JSON Recipe object
        .on('json',function (jsonObj){
            req.newMenu.push(jsonObj)
            console.log(jsonObj)
        })
        // on event "end" i.e all rows from csv have been read and csv reader will now exit block.
        .on('done',function(error){
            console.log("File read!!!!!!!!!!!!")
            next();
        })
        //next();
    }, function updateInDB(req, res,next) {
            // last function in the call change to upload menu
            user = req.params.username
            newMenu = req.newMenu

            if(req.newMenu == undefined || req.newMenu.length == 0) {
                err = new Error("Request body is missing required parameter")
                err.status=400;
                next(err);
            }
            else {
                for( i =0 ; i< newMenu.length; i++) {
                    if (newMenu[i].review == undefined) {
                        newMenu[i].count = 0;
                        newMenu[i].review = 0;
                        newMenu[i].comments = [];
                    }
                }

                console.log("New menu is :: " + newMenu);
                MongoClient.connect(url, function (err, db) {
                    db.collection('User').updateOne({ username: user },
                        {
                            $set: {"menu": newMenu}
                        }).then(function (success) {
                        // close DB and remove the file used for upload
                        db.close();
                        fs.unlinkSync(req.file.path);
                        res.status(200);
                        res.json({"result":true});
                    }, function (err) {
                        err = new Error("menu could not be set in DB")
                        err.status=400;
                        db.close();
                        next(err);
                    });
                });
            }
        });

//Update menu for given hotel to MongoDB
router.put('/hotel/users/:username/menu', function(req, res,next) {
    var user = req.params.username;
    var newMenu = req.body.menu;

    if(newMenu == undefined || newMenu == "") {
        err = new Error("Request body is missing required parameter")
        err.status=400;
        next(err);
    }
    else {
        for( i =0 ; i< newMenu.length; i++) {
            if (newMenu[i].review == undefined) {
                newMenu[i].count = 0;
                newMenu[i].review = 0;
                newMenu[i].comments = [];
            }
        }

        console.log("New menu is :: " + newMenu);
        MongoClient.connect(url, function (err, db) {
            db.collection('User').updateOne({ username: user },
                {
                    $set: {"menu": newMenu}
                }).then(function (success) {
                db.close();
                res.status(200);
                res.json({"result":true});
            }, function (err) {
                err = new Error("menu could not be set in DB")
                err.status=400;
                db.close();
                next(err);
            });
        });
    }
});

//get menu for a given hotel
router.get('/hotel/users/:username/menu', function(req, res,next) {
    var username = req.params.username;

    MongoClient.connect(url, function (err, db) {
        db.collection('User').findOne({"username":username},{ menu: 1, _id:0}).then(function (success) {
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


router.use('/hotel/users/:username/menu/:menuname', function getMenuDetail(req, res,next) {
    var username = req.params.username;
    var menuname = req.params.menuname;

    MongoClient.connect(url, function (err, db) {
        db.collection('User').findOne(
            {
                "username":username,
                "menu": {$elemMatch:
                    {name:
                        {$regex:".*"+ menuname +".*", $options: 'i'}
                    }
                }
            },
            {
                _id: 0,
                menu: {$elemMatch:
                    {name:
                        {$regex:".*"+ menuname +".*", $options: 'i'}
                    }
                }
            }).then(function (success) {
            if(success == undefined)
                success = {};
            db.close();
            res.curr_menu = success.menu[0];
            next();
        }, function (err) {
            err = new Error("Server Error while searching for "+ username);
            err.status=500;
            db.close();
            next(err);
        });
    });

});

//post a review for a menu item
router.put('/hotel/users/:username/menu/:menuname', function updateMenuReview(req, res,next) {
    var user_review = req.body.review;
    var comment = req.body.comment;

    if( user_review !== undefined) {
        res.curr_menu.count += 1;
        newReview = res.curr_menu.review + (user_review - res.curr_menu.review) / res.curr_menu.count;
        res.curr_menu.review = Math.ceil(newReview);

    }
    else
        newReview = res.curr_menu.review;

    if( comment !== undefined){
        res.curr_menu.comments.push(comment);
    }

    //update count, review, comments to DB
    MongoClient.connect(url, function (err, db) {
        db.collection('User').update({
                "username": req.params.username,
                "menu": {
                    $elemMatch: {
                        name: {$regex: ".*" + req.params.menuname + ".*", $options: 'i'}
                    }
                }
            },
            {
                $set: {
                    "menu.$.count": res.curr_menu.count,
                    "menu.$.review": res.curr_menu.review,
                    "menu.$.comments": res.curr_menu.comments
                }
            }

        ).then(function (success) {
            db.close();
            next();
        }, function (err) {
            console.log(err);
            err = new Error("menu could not be set in DB")
            err.status=400;
            db.close();
            next(err);
        });
    });


});

//post a review for a menu item
router.put('/hotel/users/:username/menu/:menuname', function (req, res,next) {
    var username = req.params.username;

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
});


module.exports = router;