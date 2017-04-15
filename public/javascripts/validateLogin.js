/**
 * Created by KD on 4/13/2017.
 */
var user=Cookies.get("username");
    if (user == "" || user == undefined) {
        window.location = "index.html";
    }

$(function () {
        $('#logout').click(function () {
            Cookies.remove("username");
            window.location = "index.html"
        });
})