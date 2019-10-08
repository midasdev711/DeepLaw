$(document).ready(function(){
    String.prototype.replaceAll = function(search, replacement) {
      var target = this;
      return target.replace(new RegExp(search, 'g'), replacement);
    };
    var getDocsToApprove = function() {
        var token = localStorage.getItem("token");
        axios.get("/api/getApprovedDocs", 
        {
            headers: {
                Authorization: "bearer " + token //the token is a variable which holds the token
            }
        })
        .then((res) => {
            if (res.data.status == "success") {
                console.log(res.data);
                var data = res.data.data;
                var htmlbody = $('.chat-module');
                var htmlcontent = ``;
                for (var i = 0; i < data.length; i++) {

                    htmlcontent += 
                        `<div>
                            <span class="docname">${data[i]._doc.url.slice(16)}</span>&nbsp;
                            <a class='doclink btn btn-default blue' href=${".." + data[i]._doc.url.slice(10).replaceAll(" ", "%20")} target="_blank">Download</a>
                        </div>
                        <br/><br/>`;
                }
                htmlbody.append(htmlcontent);
            }
            $('.approve').click(function() {
                var user = $(this).attr('data-user');
                var approver = $(this).attr('data-approver');
                var docid = $(this).attr('id');
                console.log(approver, docid);
                var content = {
                    user: user,
                    approver: approver,
                    docid: docid
                };
                axios.post("/api/approveDoc", {
                    content: content
                },
                {
                    headers: {
                        Authorization: "bearer " + token //the token is a variable which holds the token
                    }
                })
                .then((res) => {
                    $('button#' + docid).hide();
                });
            });
        });
    }

    getDocsToApprove();

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