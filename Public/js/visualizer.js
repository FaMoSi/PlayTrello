var oldPositionIndex = 1;

var host = location.origin.replace(/^http/, 'ws');
host = host.replace(/8000/, '40510')

var ws = new WebSocket(host);

// event emmited when connected
ws.onopen = function() {
  console.log('websocket is connected ...')
  // sending a send event to websocket server
  ws.send('connected')
}
// event emmited when receiving message
ws.onmessage = function(msg) {
  $("#error").html(msg.data);
  console.log(msg.data);
  if (msg.data == "Inizializzo la partita...") {
    moveBar()
    getBoards(localStorage.getItem("organization"), localStorage.getItem("token"));
  }
}

$(document).ready(function() {
  /* Detect ios 11_0_x affected
   * NEED TO BE UPDATED if new versions are affected */
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent),
    iOS11 = /OS 11_0_1|OS 11_0_2|OS 11_0_3|OS 11_1/.test(navigator.userAgent);
  /* iOS 11 bug caret position */
  if (iOS && iOS11)

  $("body").addClass("iosBugFixCaret");

  $('.parallax').parallax();
  $('.fixed-action-btn').floatingActionButton({
    hoverEnabled: false
  });

  var is_log = localStorage.getItem("is_log");

  if (is_log == "true") {
    $('#login-userButton').html("<span class=\"glyphicon glyphicon-user\"></span> " + localStorage.getItem("username"))
    $("#login-userButton").attr("onclick", "logout()");
  }

  if (document.location.pathname == "/") {
    loadHome(is_log)
  } else if (document.location.pathname.startsWith("/organization")) {
    loadOrganization(is_log)
  }
});

function loadHome(is_log) {
  //loadHome
  $("#searchBarContainer").show();
  $(".message-container").hide()
  $(".input-field").hide()
  $(".fixed-action-btn").hide()
}

$(".navbar-brand").on("click", function () {
  window.history.pushState({}, '', "/");
  location.reload()
});

$('#searchBarContainer > input').on('keypress', function(e) {
  if (e.keyCode == 13) {
    localStorage.setItem("organization", $(this).val());
    window.history.pushState({}, '', "organization=" + localStorage.getItem("organization"));
    loadOrganization(localStorage.getItem("is_log"))
    //location.reload()
  }
});

$("#numberOP").on("change", function(select) {
  var nop = select.currentTarget.value
  $(".input-field").hide()
  $("#searchBarContainer").hide()
  $.ajax({
    url: '/api/init/nop?nop=' + 1 + "&organization=" + localStorage.getItem("organization") + "&token=" + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        console.log(res.isStart);
        if (res.isStart) {
          moveBar()
          getBoards(localStorage.getItem("organization"), localStorage.getItem("token"));
        } else {
          initGame(localStorage.getItem("organization"), localStorage.getItem("token"))
        }
      } else {
        console.log(res.message);
        $("#players").html("");
        $("#error").html("<p>" + res.message + "</p>");
      }
    },
    error: function(err) {
      console.log("Error: " + err);
    }
  });
})

function loadOrganization(is_log) {
  $("#error").html("");
  $(".fixed-action-btn").hide()
  if (is_log == "true") {
    $("#searchBarContainer").hide()
    $('html').animate({
        scrollTop: $("#searchBarContainer").offset().top
      },
      'slow');
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    $(".message-container").show()
    console.log(localStorage.getItem("organization"));
    $.ajax({
      url: '/api/init/organization?organization=' + localStorage.getItem("organization") + "&token=" + localStorage.getItem("token"),
      success: function(res) {
        if (res.success) {
          $("#error").html("");
          $(".input-field").show();
          if (res.isSetNop) {
            eventFire(document.getElementById('numberOP'), 'change');
          }
          //initGame(localStorage.getItem("organization"), localStorage.getItem("token"))
          //getBoards(localStorage.getItem("organization"), localStorage.getItem("token"));
        } else {
          $("#searchBarContainer").show()
          $("#players").html("");
          $("#error").html("<p>" + res.message + "</p>");
        }
      },
      error: function(err) {
        console.log("Error: " + err);
      }
    });
  } else {
    $(".input-field").hide()
    //$("#error").html("<p>Effettua il login per continuare</p>");
    alert("Effettua il login per continuare")
  }
}

function getBoards(organization, token) {
  $("#searchBarContainer").hide()
  $(".input-field").hide()
  $("#error").html("")
  $(".players-container").html("")
  $.ajax({
    url: '/api/game/boards?organization=' + localStorage.getItem("organization") + "&token=" + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        $("#progressmsg").hide()
        $(".players > .message").text("Scegli la pedina:")
        var index = 1;
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].name != "Scatola") {
            var imgsrc
            if (res.data[i].prefs.backgroundImage != null) {
              imgsrc = res.data[i].prefs.backgroundImage
            } else {
              imgsrc = "https://i.pinimg.com/originals/3b/4b/b9/3b4bb9846a1f2f5adc87b849e9f3dbea.jpg"
            }

            $(".players-container").append("<div class=\"card col-xs-12 col-sm-8 col-md-6 col-lg-3\" style=\"width: 18rem;\"> <img class=\"card-img-top-board\" src=\"" + imgsrc + "\" alt=\"Card image cap\"> <div class=\"card-body\"><div class=\"anchor-container\" style=\"text-align: center;\"><a href=\"javascript:void(0)\" class=\"waves-effect waves-light btn\" onClick=loadPlayer(\"" + res.data[i].id + "\")>" + res.data[i].name + "</a></div></div></div>")
            index++
          } else {
            localStorage.setItem("idScatola", res.data[i].id);
          }
        }
      }
    },
    error: function(err) {
      console.log("Error getBoards: " + err);
    }
  });
}

function initGame(organization, token) {
  $("#progressmsg").text("Inizializzo la partita...")
  moveBar()
  setStartPosition(organization, token)
}

function setStartPosition(organization, token) {
  console.log("setStartPosition");
  $.ajax({
    url: '/api/init/initialize?organization=' + localStorage.getItem("organization") + "&token=" + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {

      }
    },
    error: function(err) {
      console.log("Error getBoards: " + err);
    }
  });
}

function moveBar() {
  var elem = document.getElementById("myBar");
  var width = 1;
  var id = setInterval(frame, 5);

  function frame() {
    if (width >= 100) {
      clearInterval(id);
    } else {
      width++;
      elem.style.width = width + '%';
    }
  }
}


function loadPlayer(id, name) {
  console.log(id);
  localStorage.setItem("playerBoardId", id);
  $(".players").html("<h6>" + id + "<h6>");
  $("#error").html("");
  $.ajax({
    url: '/api/init/start?organization=' + localStorage.getItem("organization"),
    success: function(res) {
      if (res.success) {
        console.log(res.isStart);
        if (!res.isStart) {
          giveContratti(id, function() {
            $("#progressmsg").hide()
            $(".Trello-cards").show()
            $(".fixed-action-btn").show()
          })
        } else {
          $("#progressmsg").hide()
          $(".Trello-cards").show()
          $(".fixed-action-btn").show()
        }
      }
    },
    error: function(err) {
      console.log("Error getPosition: " + err);
    }
  });
}

function giveContratti(id, callback) {
  moveBar()
  $("#progressmsg").text("Distribuendo i contratti..")
  $("#progressmsg").show()
  $.ajax({
    url: '/api/init/contratti?boardId=' + id + '&token=' + localStorage.getItem("token") + "&organization=" + localStorage.getItem("organization"),
    success: function(res) {
      if (res.success) {
        callback();
      }
    },
    error: function(err) {
      console.log("Error getPosition: " + err);
    }
  });
}

$("#launchDice").on("click", function(e) {
  e.preventDefault();
  var min = Math.ceil(2);
  var max = Math.floor(12);
  var result = Math.floor(Math.random() * (max - min + 1)) + min
  localStorage.setItem("dadi", result);
  $("#resultDice").text(result);
  movePlayer(result);
})

$(".fixed-action-btn").on("click", function (e) {
  e.preventDefault()
  $.ajax({
    url: '/api/init/gameover?organization=' + localStorage.getItem("organization"),
    success: function(res) {
      console.log(res.message);
      window.history.pushState({}, '', "/");
      location.reload()
    },
    error: function(err) {
      console.log("Error Gameover: " + err);
    }
  });
})

function movePlayer(n) {
  $.ajax({
    url: '/api/game/position?id=' + localStorage.getItem("playerBoardId") + '&token=' + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        var oldPosition = res.cardId
        var oldPositionName = res.position
        console.log("Actual position: " + oldPositionName);
        console.log("oldIndex: " + oldPositionIndex);
        oldPositionIndex += n
        if (oldPositionIndex > 40) {
          oldPositionIndex = oldPositionIndex - 40
        }
        console.log("newIndex: " + oldPositionIndex);
        console.log(oldPositionIndex);
        $.ajax({
          url: '/api/game/move?newPosition=' + oldPositionIndex + '&organization=' + localStorage.getItem("organization") + '&token=' + localStorage.getItem("token"),
          success: function(res) {
            console.log(res.newPosition);
            archiveOldPosition(oldPosition, oldPositionName);
          },
          error: function(err) {
            console.log("Error getPositionIn: " + err);
          }
        });
      } else {

      }
    },
    error: function(err) {
      console.log("Error getPosition: " + err);
    }
  });
}

function archiveOldPosition(cardId, cardName) {
  $.ajax({
    url: '/api/game/archive?cardId=' + cardId + '&token=' + localStorage.getItem("token"),
    success: function(res) {
      if (res.success) {
        console.log("Archive " + cardName);
      }
    },
    error: function(err) {
      console.log("Error getPosition: " + err);
    }
  });
}

function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}
