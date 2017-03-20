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

var searchResult = [{
    "hotelname" : "Hotel1",
    "username": "testEmail1@email.com",
    "distance":3.4,
    "openNow":"true",
    "menu":[{"name":"item1","description":"Description1", "review": 3, "comment": ["cmt1","cmt2", "cmt3"]},
        {"name":"item2","description":"description2","review":5,"comment": ["cmt1","cmt2", "cmt3"]}],
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
}];

//Get List of Hotels based on user location and preferences
router.get('/search', function (req, res, next) {

    console.log(process.env.GEOCODE_API);
    var lat = req.query.lat;
    var long = req.query.long;
    var user_city ="";


    // Get user address from LatLong.
    googleMapsClient.reverseGeocode({
        latlng: [lat,long]
    }, function(err, response) {
        if (!err) {
            console.log(response.json.results);
            address_list = response.json.results[0].address_components;

            for (var i = 0, len = address_list.length; i < len; i++) {
                if(address_list[i].types[0]=="locality") {
                    user_city = address_list[i].long_name;
                    console.log("Setting user_city to " + user_city)
                }
            }
            res.json(searchResult);
            //res.json(response.json.results);
        }
    });
});

//Get Hotel User by username from MongoDB
router.get('/dummy', function (req, res, next) {

    res.json(searchResult)
});



module.exports = router;