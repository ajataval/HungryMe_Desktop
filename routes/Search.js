/**
 * Created by KD on 3/2/2017.
 */
var express = require('express');
var router = express.Router();

var googleMapsClient = require('@google/maps').createClient({
    key: process.env.GEOCODE_API
});

const monk = require('monk');
const url = 'mongodb://serteam6:hungryme123@ds153179.mlab.com:53179/hungryme';
const db = monk(url);
const collection =  db.get('User');



var searchResult = [{
    "hotelname" : "Hotel1",
    "username": "testEmail1@email.com",
    "distance":3.4,
    "openNow":"true",
    "menu":[{"name":"item1","description":"Description1", "review": 3, "comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item2","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item3","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item4","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item5","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item6","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item7","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item8","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item9","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"ite10","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item11","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item12","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item13","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item14","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item15","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item16","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item17","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item18","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item19","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item20","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1255, E University Dr, Tempe, AZ 85281",
    "cuisine":"Italian"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}, {
    "hotelname" : "Hotel2",
    "username": "testEmail2@email.com",
    "distance":4.6,
    "openNow":"true",
    "menu":[{"name":"dish1","description":"dish1", "review": 2,"comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"dish2","description":"dish2","review":4,"comment": ["cmt1","cmt2", "cmt3"]}],
    "address":"1207, E 8 Street, Tempe, AZ 85281",
    "cuisine":"American"
}];

//Get Hotel User by username from MongoDB
router.get('/dummy', function (req, res, next) {
    res.json(searchResult)
});

// Get Users Address using lat long coordinates
router.use('/search', function getUserLocation (req, res, next){
    // Get user address from LatLong.
    googleMapsClient.reverseGeocode({
        latlng: [req.query.lat,req.query.long]
    }, function(err, geoResponse) {
        if (!err) {
            console.log(geoResponse.json.results);
            res.geocode = geoResponse.json.results;
            address_list = geoResponse.json.results[0].address_components;

            for (var i = 0, len = address_list.length; i < len; i++) {
                if(address_list[i].types[0]=="locality") {
                    req.user_city = address_list[i].long_name;
                    console.log("Setting user_city to " + req.user_city)
                }
            }
            next();
        }
    });
});

// Get Nearby Hotels from google's NearbyAPI
router.use('/search', function getGoogleHotelList (req, res, next){
    // Get user address from LatLong.
    googleMapsClient.placesNearby({
        location: [req.query.lat,req.query.long],
        //radius: 10000,
        type:"restaurant",
        rankby:"distance"
    }, function(err, geoResponse) {
        if (!err) {
            console.log(geoResponse.json.results);
            res.googleHotelList = geoResponse.json.results;
            next();
        }
        else
            next(err);
    });
});


//apply user filters to obtain list of hotels from hungryMe DB
router.use('/search', function getHungryMeHotelList (req, res, next){
    var searchfilter = {};

    if(req.query.cuisine !== undefined){
        //search by cuisine type
        searchfilter = {"cuisine": req.query.cuisine};
    }
    else if(req.query.menu !== undefined) {
        //search by specific menu
        searchfilter = {"menu": {$elemMatch: {name:{$regex:".*"+ req.query.menu +".*", $options: 'i'}}}};
    }
    else {
        //default city limited search
        searchfilter = {"address": {$regex:".*"+ req.user_city +".*", $options: 'i'}};
    }

    collection.find(searchfilter).then(function (docs){
        res.hungryMeDbList = docs;
        next();
    });
});

// Get Hotels present in both list.
router.use('/search', function getFilteredList (req, res, next){

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
    console.log(res.filteredList);
    next();
});


router.use('/search', function getDistance  (req, res, next){

    var dest = "";
    for (i=0; i< res.filteredPlaces.length; i++){
        dest+="place_id:"+res.filteredPlaces[i]+"|";
    }

    dest = dest.substr(0,dest.length-1)
    console.log("Length : " + dest.length + "  ::::  dest: " + dest);
    //get distance from user current location to hotel
    googleMapsClient.distanceMatrix({
        origins: req.query.lat +','+ req.query.long,
        destinations:dest,
        units:"imperial"
    }, function(err, geoResponse) {
        if (!err) {
            console.log(geoResponse.json.rows[0].elements);
            res.googleDistanceList = geoResponse.json.rows[0].elements;

            for( i=0; i < res.filteredList.length; i++){
                res.filteredList[i].distance = res.googleDistanceList[i].distance.text;
                res.filteredList[i].openNow = "true";
            }
            next();
        }
        else
            next(err);
    });
});
//Get List of Hotels based on user location and preferences
router.get('/search', function (req, res, next) {


    var lat = req.query.lat;
    var long = req.query.long;
    res.send(res.filteredList);
});

module.exports = router;