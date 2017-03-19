$(document).ready(function() {
	$('#sigbut').click(function(){
		alert("Clicked!");
		var user = $('#user').val();
		var pass = $('#pass').val();
		var email= $('#em').val();
		var formdata = {"username" : user,
					"password" : pass,
					"email" : email};
					
		$.ajax({
			type : "POST",
			url : "/hotel/users",
			data : JSON.stringfy(formdata),
			contentType: "application/json"
		}).done(function(obj){
			console.log(obj);
			if(obj.status == 201){
				alert("successfully created");}
			else{
				alert ("Error Creating Account");}
		 }).fail(function(obj){
			alert("Failed");
		 });
	});
});

/*
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
	
	*/