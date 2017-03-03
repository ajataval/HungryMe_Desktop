$('.message a').click(function(){
   $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});

$('.sigbut').click(function(){
	window.alert("entered");
	var user = $('.user').value();
	var pass = $('.pass').value();
	var email= $('.em').value();
	var formdata = {"username" : user,
				"password" : pass,
				"email" : email};
				
	$.ajax({
		method : "POST",
		url : "https://hungrymeser.herokuapp.com/hotel/user",
		data : formdata
	}).done(function(obj){
        alert("sucess");
    }).fail(function(obj){
        alert("Failed");
    });
});