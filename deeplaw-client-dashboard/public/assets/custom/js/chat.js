$(document).ready(function(){

    $(".chat-module-body").scrollTop($(".chat-module-body").height());

    var token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/";
    }

    var getChats = function() {
        var token = localStorage.getItem("token");
        axios.get("/api/getChats", 
        {
            headers: {
                Authorization: "bearer " + token //the token is a variable which holds the token
            }
        })
        .then((res) => {
            if (res.data.status == "success") {
                var username = localStorage.getItem("username");
                $("h5.nav-user-name").text(username);
                var contents = res.data.data;
                var contentmodule = $(".chat-module-body");
                contentmodule.empty();
                var htmlcontent = ``;
                contents.sort((a, b) => parseFloat(a.date) - parseFloat(b.date));
                console.log(contents);
                for (var i = 0; i < contents.length; i++) {
                    var now = new Date();
                    var contentdate = new Date(contents[i].date);

                    var diff = moment.utc(moment(now,"DD/MM/YYYY HH:mm:ss").diff(moment(contentdate,"DD/MM/YYYY HH:mm:ss")));
                    var daydiff = diff.format("DD");
                    var monthdiff = diff.format("MM");
                    var hourdiff = diff.format("HH");
                    var minutediff = diff.format("mm");
                    var diffString = "";
                    var seconddiff = diff / 1000;
                    if (seconddiff < 60) {
                        diffString = "Just now";
                    }
                    if (seconddiff > 60 && seconddiff < 120) {
                        diffString = "A miniute ago";
                    }
                    if (seconddiff > 120 && seconddiff < 3600) {
                        diffString = Math.floor(seconddiff / 60) + " miniutes ago";
                    }
                    if (seconddiff > 3600) {
                        if (seconddiff / 3600 == 1) {
                            diffString = "An hour ago";
                        }
                        else {
                            diffString = Math.floor(diff / 3600000) + " hours ago";
                        }
                    }
                    if ( seconddiff / 3600 == 24 )
                    {
                        diffString = "A day ago";
                    }
                    if (seconddiff / 3600 >= 48) {
                        diffString = Math.floor(seconddiff / (3600 * 24)) + " days ago";
                    }

                    htmlcontent += `<div class="media chat-item">`;
                    if (contents[i].sender != "Elaina") {
                        htmlcontent += `<span class="chat-avatar">${contents[i].sender.charAt(0).toUpperCase()}</span>`;
                    }
                    else {
                        htmlcontent += `<img class="img-rounded img-responsive" src="./assets/custom/images/Deeplaw_Fevicon.png" height="48">`;
                    }
                        
                    htmlcontent += `
                        <div class="media-body">
                            <div class="chat-item-title">
                                <span class="chat-item-author">${contents[i].sender}</span>
                                <span>${diffString}</span>
                            </div>
                            <div class="chat-item-body">
                                <p>${contents[i].text}</p>
                            </div>
                        </div>
                    </div>`;
                }
                contentmodule.append(htmlcontent);
                var count = $(".chat-item").length;
                $(".chat-module-body").scrollTop(145 * count);
            }
        });
    }
    getChats();
    

    $('body').on('click', '#logout', function(event) {
        localStorage.clear();
        window.location.href = "/";
    });

    $('body').on('keyup', 'form.chat-form textarea', function(event) {
        var content = $(this).val();
        if (event.keyCode == 13 && !event.shiftKey) {
            var token = localStorage.getItem("token");
            var username = localStorage.getItem("username");
            var contentmodule = $(".chat-module-body");
            var htmlcontent = `
                <div class="media chat-item">
                    <span class="chat-avatar">${username.charAt(0).toUpperCase()}</span>
                    <div class="media-body">
                        <div class="chat-item-title">
                            <span class="chat-item-author">${username}</span>
                            <span>Just now</span>
                        </div>
                        <div class="chat-item-body">
                            <p>${content}</p>
                        </div>
                    </div>
                </div>`;
            contentmodule.append(htmlcontent);
            var count = $(".chat-item").length;
            $(".chat-module-body").scrollTop(145 * count);
            axios.post("/api/chat", {
              content: content
            },
            {
                headers: {
                    Authorization: "bearer " + token //the token is a variable which holds the token
                }
            })
            .then((res) => {
                if (res["data"]["status"] == 'success') {
                    $(this).val("");
                    getChats();
                }
            })
            .catch(() => {
                console.log("Sorry. Server unavailable. ");
            }); 
        }
        
    });
})