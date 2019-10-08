$(document).ready(function() {
	$('body').on('submit', 'form#signupform', function(event) {
        var username = $('form#signupform #username').val();
        var email = $('form#signupform #email').val();
        var password = $('form#signupform #password').val();
        var data = {
        	"username": username,
        	"email": email,
        	"password": password
        }
        $.ajax({
            url: "/auth/register",
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json",
            success: (res) => {
                localStorage.setItem("token", res.token);
                localStorage.setItem("username", username);
                window.location.href = "/chat";
            }
        });
    });

    $('body').on('submit', 'form#signinform', function(event) {
        var username = $('form#signinform #username').val();
        var password = $('form#signinform #password').val();
        var data = {
            "username": username,
            "password": password
        }
        $.ajax({
            url: "/auth/login",
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json",
            success: (res) => {
                console.log(res);
                localStorage.setItem("token", res.token);
                localStorage.setItem("username", username);
                if (res.role == "admin") {
                    window.location.href = "/approve";
                }
                else
                    window.location.href = "/chat";
            }
        });
    });
});