/**
 * Created by KD on 3/2/2017.
 */
var express = require('express');
var router = express.Router();
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const csv=require('csvtojson')
var fs = require('fs');


var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = process.env.MONGO_URL;

var updateUserPreference = function (cuisine, rating, appUser) {
    MongoClient.connect(url, function (err, db) {
        db.collection('User').findOne({"username":appUser})
            .then(function (usr) {

                if( usr.revCuisine != undefined){
                    revCuisine = usr.revCuisine;
                }
                else
                    revCuisine =[]
                db.close();

                if(revCuisine.length == 0)
                //user has reviewed for the first time
                    revCuisine.push({"cuisine":cuisine,"rating":rating});
                else if(revCuisine.length < 3){
                    // user hasn't reviewed more that 3 times
                    var found = false;
                    for ( i=0; i< revCuisine.length; i++){
                        if(revCuisine[i].cuisine == cuisine ){
                            // User has previously reviewed this cuisine
                            if(revCuisine[i].rating < rating)
                                revCuisine[i].rating = rating;
                            found = true;
                            break;
                        }
                    }
                    if(!found){
                        // user reviewed new cuisine
                        for ( i=0; i< revCuisine.length; i++) {
                            if (revCuisine[i].rating < rating) {
                                revCuisine.splice(i, 0, {"cuisine": cuisine, "rating": rating})
                                found = true;
                                break;
                            }
                        }
                        if(!found){
                            revCuisine.push({"cuisine": cuisine, "rating": rating})
                        }
                    }
                }
                else {
                    // user reviewed more that 3 times
                    var found = false;
                    for ( i=0; i< revCuisine.length; i++){
                        if(revCuisine[i].cuisine == cuisine && revCuisine[i].rating < rating) {
                            // User has previously reviewed this cuisine
                            revCuisine[i].rating = rating;
                            found = true;
                            break;
                        }
                    }
                    if(!found){
                        // find the position
                        var position = Infinity;
                        for ( i=0; i< revCuisine.length; i++){
                            if(revCuisine[i].rating < rating) {
                                // position for new rating found
                                position = i;
                                break;
                            }
                        }
                        if(position < 3){
                            revCuisine.splice(position,0,{"cuisine":cuisine,"rating":rating});
                            revCuisine.pop();
                        }
                    }
                }
                // set new revCuisine Object
                MongoClient.connect(url, function (err, db) {
                    db.collection('User').update({
                            "username": appUser,
                        },
                        {
                            $set: {"revCuisine": revCuisine}
                        }
                        ).then(function (success) {
                        console.log("User preference Updated")
                    }, function (err) {
                        err = new Error("Could Not add to DB")
                        err.status=400;
                        console.log(err);
                        db.close();
                    });
                });
            }, function (err) {
                err = new Error("Server Error while searching for "+ username);
                err.status=500;
                console.log(err);
                db.close();
            });
    });
}

var parseCSVtoJSON = function (req, res,next) {
    // next function in the process to update menu will be called after upload function from csv package uploads
    // file to temporary folder.
    console.log(req.file);

    req.newMenu = [];
    csvFilePath=req.file.path;
    csv()
        .fromFile(csvFilePath)
        // on event"json" i.e a row is read from csv and converted to JSON Recipe object
        .on('json',function (jsonObj){
            if(jsonObj.name == undefined || jsonObj.name == ''
                || jsonObj.description == undefined || jsonObj.description == '') {
                err = new Error("Name or Description missing in given file")
                err.status=400;
                next(err);

            }
            req.newMenu.push(jsonObj)
            console.log(jsonObj)
        })
        // on event "end" i.e all rows from csv have been read and csv reader will now exit block.
        .on('done',function(error){
            console.log("File read complete")
            next();
        })
    //next();
}

var retainExistingMenu = function (req, res,next) {
    // call mongo to get menu for this user
    var username = req.params.username;

    MongoClient.connect(url, function (err, db) {
        db.collection('User').findOne({"username":username},{ menu: 1, _id:0}).then(function (success) {
            if(success == undefined)
                next();
            else if(success.menu !== undefined){
                // update existing menu items in new menu to retain reviews
                for( i =0; i < success.menu.length; i++){
                    for( j=0; j< req.newMenu.length;j++){
                        if(req.newMenu[j].name == success.menu[i].name){
                            req.newMenu[j].count = success.menu[i].count;
                            req.newMenu[j].review = success.menu[i].review;
                            req.newMenu[j].comments = success.menu[i].comments;
                        }
                    }
                }
                //console.log(req.newMenu)
                next();
            }
        }, function (err) {
            err = new Error("Server Error while searching for "+ username);
            err.status=500;
            db.close();
            next(err);
        });
    });
}
//Update menu for given hotel to MongoDB using file
router.post('/hotel/users/:username/uploadMenu', upload.single('menufile'), parseCSVtoJSON,
    retainExistingMenu, function updateNewMenuInDB(req, res,next) {
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

            //console.log("New menu is :: " + newMenu);
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

//Update menu for given hotel to MongoDB from UI
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
            if(newMenu[i].name == undefined || newMenu[i].name == ''
                || newMenu[i].description == undefined || newMenu[i].description == '') {
                err = new Error("Name or Description missing in given input")
                err.status=400;
                next(err);

            }
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


var getMenuDetail = function (req, res,next) {
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
                },
                cuisine:1
            }).then(function (success) {
            if(success == undefined)
                success = {};
            db.close();
            if( req.body.review > 3 && (req.body.appUser != undefined|| req.body.appUser != ""))
                updateUserPreference(success.cuisine,req.body.review,req.body.appUser)
            res.curr_menu = success.menu[0];
            next();
        }, function (err) {
            err = new Error("Server Error while searching for "+ username);
            err.status=500;
            db.close();
            next(err);
        });
    });

}

//post a review for a menu item
router.put('/hotel/users/:username/menu/:menuname', getMenuDetail,function updateMenuReview(req, res,next) {
    var user_review = req.body.review;
    var comment = req.body.comment;

    if( user_review !== undefined && user_review !== 0) {
        res.curr_menu.count += 1;
        var newReview = res.curr_menu.review + (user_review - res.curr_menu.review) / res.curr_menu.count;
        res.curr_menu.review = parseFloat(newReview.toFixed(2));

    }
    else
        newReview = res.curr_menu.review;

    if( comment !== undefined && comment !== ""){
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