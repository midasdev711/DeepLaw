$(document).ready(function() {
    function getParamValue(paramName)
    {
        var url = window.location.search.substring(1); //get rid of "?" in querystring
        var qArray = url.split('&'); //get key-value pairs
        for (var i = 0; i < qArray.length; i++) 
        {
            var pArr = qArray[i].split('='); //split key and value
            if (pArr[0] == paramName) 
                return pArr[1]; //return value
        }
    }
    var tokenFromURL = getParamValue('key');
    var token = localStorage.getItem("token");
    if (tokenFromURL) {
        localStorage.setItem('token', tokenFromURL);
    }
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