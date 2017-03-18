$('button').click(function(){
	alert("entered");
	var user = $('#user').val();
	var pass = $('#pass').val();
	var email= $('#em').val();
	var formdata = {"username" : user,
				"password" : pass,
				"email" : email};
				
	alert(formdata);
	$.ajax({
		type : "POST",
		url : "https://hungrymeser.herokuapp.com/hotel/user",
		data : JSON.stringfy(formdata),
		contentType: "application/json"
	}).done(function(obj){
		alert("sucess");
	 }).fail(function(obj){
		alert("Failed");
	 });
});

document
	.getElementById('target')
	.addEventListener('change', function () {
		'use strict';
		var vis = document.querySelector('.vis'),   
		target = document.getElementById(this.value);
		if (vis !== null){
			vis.className = 'inv';
		}
		if (target !== null ){
			target.className = 'vis';
		}
	});