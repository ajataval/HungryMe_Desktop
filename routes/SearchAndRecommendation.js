/**
 * Created by KD on 3/2/2017.
 */
var express = require('express');
var router = express.Router();

var googleMapsClient = require('@google/maps').createClient({
    key: process.env.GEOCODE_API
});

const monk = require('monk');
const url = process.env.MONGO_URL;
const db = monk(url);
const collection =  db.get('User');

//Get Hotel User by username from MongoDB
router.get('/dummy', function (req, res, next) {
    res.json({})
});

// Get Users Address using lat long coordinates
var getUserLocation = function(req, res, next) {

    if (req.query.lat == undefined || req.query.lat==""
            || req.query.long == undefined || req.query.long =="") {
        err = new Error("Lat long cannot be empty");
        err.status = 400;
        next(err);
    }

    // Get user address from LatLong.
    googleMapsClient.reverseGeocode({
        latlng: [req.query.lat,req.query.long]
    }, function(err, geoResponse) {
        if (!err) {
            res.geocode = geoResponse.json.results;
            address_list = geoResponse.json.results[0].address_components;
            console.log("Users Current address is :: "+ geoResponse.json.results[0].formatted_address)
            for (var i = 0, len = address_list.length; i < len; i++) {
                if(address_list[i].types[0]=="locality") {
                    req.user_city = address_list[i].long_name;
                    console.log("Setting user_city to " + req.user_city)
                }
            }
            next();
        }
    });
}

// Get Nearby Hotels from google's NearbyAPI
var getGoogleHotelList = function(req, res, next){
    // Get user address from LatLong.
    googleMapsClient.placesNearby({
        location: [req.query.lat,req.query.long],
        //radius: 10000,
        type:"restaurant",
        rankby:"distance"
    }, function(err, geoResponse) {
        if (!err) {
            //console.log(geoResponse.json.results);
            console.log("GoogleNearby API call successul");
            res.googleHotelList = geoResponse.json.results;
            next();
        }
        else
            next(err);
    });
}


//apply user filters to obtain list of hotels from hungryMe DB
var getHungryMeHotelList = function(req, res, next){
    var searchfilter = {};

    if(req.query.cuisine !== undefined){
        //search by cuisine type
        searchfilter = {"cuisine": {$regex:".*"+ req.query.cuisine +".*", $options: 'i'}};
    }
    else if(req.query.menu !== undefined) {
        //search by specific menu
        searchfilter = {"menu": {$elemMatch: {name:{$regex:".*"+ req.query.menu +".*", $options: 'i'}}}};
    }
    else {
        //default city limited search
        if(req.user_city == undefined || req.user_city == ""){
            err = new Error("Server failed to get user current location");
            err.status = 500;
            next(err);
        }
        searchfilter = {"address": {$regex:".*"+ req.user_city +".*", $options: 'i'}};
    }

    collection.find(searchfilter).then(function (docs){
        res.hungryMeDbList = docs;
        next();
    });
}

// Get Hotels present in both list.
var getFilteredList = function (req, res, next){

    var map = {};
    res.filteredList = [];
    res.filteredPlaces = [];
    var dblist = true
    // create a map with smaller list
    if( res.googleHotelList.length > res.hungryMeDbList.length){
        for ( i=0; i< res.hungryMeDbList.length; i++) {
            map[res.hungryMeDbList[i].place_id] = 1;
        }
        dblist = true;

    }
    else {
        for ( i=0; i< res.googleHotelList.length; i++) {
            map[res.googleHotelList[i].place_id] = 1;
        }
        dblist =false;
    }

    if(dblist){
        //iterate over google list
        for ( i=0; i< res.googleHotelList.length; i++) {
            if(map[res.googleHotelList[i].place_id] !== undefined)
                map[res.googleHotelList[i].place_id]++;
        }

        for( i=0; i< res.hungryMeDbList.length; i++) {
            if( map[res.hungryMeDbList[i].place_id] == 2) {
                // match found. add to filtered list
                res.filteredList.push(res.hungryMeDbList[i]);
                res.filteredPlaces.push(res.hungryMeDbList[i].place_id);
            }
        }
    }
    console.log("Total Hotels found near user: "+ res.filteredList.length);
    next();
}


var getDistance = function (req, res, next){

    if(res.filteredList.length == 0){
        next();
    }
    else {
        var dest = "";

        for (i = 0; i < res.filteredPlaces.length; i++) {
            dest += "place_id:" + res.filteredPlaces[i] + "|";
        }

        dest = dest.substr(0, dest.length - 1)
        //console.log("Length : " + dest.length + "  ::::  dest: " + dest);
        //get distance from user current location to hotel
        googleMapsClient.distanceMatrix({
            origins: req.query.lat + ',' + req.query.long,
            destinations: dest,
            units: "imperial"
        }, function (err, geoResponse) {
            if (!err) {
                //console.log(geoResponse.json.rows[0].elements);
                console.log("Google Distance Matrix api call successful")
                res.googleDistanceList = geoResponse.json.rows[0].elements;

                for (i = 0; i < res.filteredList.length; i++) {
                    res.filteredList[i].distance = res.googleDistanceList[i].distance.text;
                    res.filteredList[i].openNow = "true";
                }
                next();
            }
            else
                next(err);
        });
    }
}
//Get List of Hotels based on user location and preferences
router.get('/search',getUserLocation, getGoogleHotelList, getHungryMeHotelList, getFilteredList, getDistance,function (req, res, next) {
    res.send(res.filteredList);
});


//apply user filters to obtain list of hotels from hungryMe DB
var getUserPreferedHotelList = function(req, res, next){

    var username = req.params.username
    var searchfilter = {};


    collection.find({"username":username})
            .then(function (success) {
                var appUser = success[0]
                var cuisineArray = []

                if(appUser.revCuisine != undefined) {
                    for (i = 0; i < appUser.revCuisine.length; i++) {
                        cuisineArray.push(appUser.revCuisine[i].cuisine)
                    }

                    if (cuisineArray.length > 0) {
                        searchfilter = {"cuisine": {$in: cuisineArray}};
                    }
                }
                else {
                    searchfilter = {"address": {$regex:".*"+ req.user_city +".*", $options: 'i'}};
                }

                collection.find(searchfilter).then(function (docs){
                    res.hungryMeDbList = docs;
                    next();
                });

            }, function (err) {
                err = new Error("Server Error while searching for "+ username);
                err.status=500;
                db.close();
                next(err);
            });
}
router.get('/app/users/:username/recommend',getUserLocation, getGoogleHotelList, getUserPreferedHotelList, getFilteredList, getDistance,function (req, res, next) {
    res.send(res.filteredList);
});

module.exports = router;