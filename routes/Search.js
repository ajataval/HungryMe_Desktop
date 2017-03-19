/**
 * Created by KD on 3/2/2017.
 */
var express = require('express');
var router = express.Router();

const monk = require('monk');
const url = 'mongodb://serteam6:hungryme123@ds153179.mlab.com:53179/hungryme';
const db = monk(url);

//Get Hotel User by username from MongoDB
router.get('/dummy', function (req, res, next) {
    searchResult = [{
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
    res.json(searchResult)
});



module.exports = router;