$(document).ready(function() {
	var getMe = function() {
        var token = localStorage.getItem("token");
        if (!token) {
        	window.location.href = "/";
        }
        axios.get("/api/me", 
        {
            headers: {
                Authorization: "bearer " + token //the token is a variable which holds the token
            }
        })
        .then((res) => {
        	let data = res['data'];
        	localStorage.setItem('username', data['username']);
        	var username = localStorage.getItem("username");
        	var avatarletter = username.slice(0,1).toUpperCase()
        	console.log(avatarletter, typeof(username));
        	$("span.nav-avatar").text(avatarletter);
        });
    }

    getMe();

	$('body').on('click', '#navbarNav>ul>li.nav-item>a', function(event) {
        $("#navbarNav a").removeClass('active');
        $(this).addClass('active');
    });
});