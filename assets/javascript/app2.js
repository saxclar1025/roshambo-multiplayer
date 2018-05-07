var config = {
    apiKey: "AIzaSyCAsHh9AA8FxJzCfXibfsbxur4BWHQJjCs",
    authDomain: "roshambo-3293b.firebaseapp.com",
    databaseURL: "https://roshambo-3293b.firebaseio.com",
    projectId: "roshambo-3293b",
    storageBucket: "roshambo-3293b.appspot.com",
    messagingSenderId: "715476833630"
  }
firebase.initializeApp(config);
var database = firebase.database();

const choices = ["Rock", "Paper", "Scissors"];

var Player = function(name){
    this.name = name;
    this.wins = 0;
    this.losses = 0;
    this.choice = -1;
}

var userPlayer = 0;
var player1 = null;
var player2 = null;

$("#name-form").submit(event=>{
    event.preventDefault();
    if(!player1) {
        userPlayer = 1;
        database.ref("players").update({player1:new Player($("#name-input").val())});
        if (!!player2) {
            database.ref().update({turn:1});
        }
    }
    else {
        userPlayer = 2;
        database.ref("players").update({player2:new Player($("#name-input").val())});
        if (!!player1) {
            database.ref().update({turn:1});
        }
    }
    $("#player-req-div").hide();
    $("#player-div").html("<p>Hi " + $("#name-input").val() + "! You are Player " + userPlayer + "</p>").show();
    database.ref("players/player" + userPlayer).onDisconnect().remove();
    database.ref("turn").onDisconnect().set(0);
});

database.ref("turn").on("value", snapshot=>{
    if(snapshot.val() === 0) {
        console.log("Turn 0: Game not started");
        $("#player1-choices").hide();
        $("#player2-choices").hide();
        $("#turn-indicator").hide();
        $("#result-div").empty();
        $("#player1-div").removeClass("border-warning");
        $("#player2-div").removeClass("border-warning");
        return;
    }
    if(snapshot.val() === 1) {
        console.log("Player 1's Turn");
        $("#result-div").empty();
        $("#player2-choices").hide();
        $("#player1-div").addClass("border-warning");
        $("#player2-div").removeClass("border-warning");
        if(userPlayer === 1) {
            $("#player1-choices").show();
            $("#turn-indicator").show().html("<p>It's Your Turn, " + player1.name + "!</p>");
            return;
        }
        $("#turn-indicator").show().html("<p>Waiting for " + player1.name + " to choose...</p>");
        return;
    }
    if(snapshot.val() === 2) {
        console.log("Player 2's Turn");
        $("#player1-div").removeClass("border-warning");
        $("#player2-div").addClass("border-warning");
        if(userPlayer === 2) {
            $("#player2-choices").show();
            $("#turn-indicator").show().html("<p>It's Your Turn, " + player2.name + "!</p>");
            return;
        }
        $("#player1-choices").hide();
        $("#turn-indicator").show().html("<p>Waiting for " + player2.name + " to choose...</p>");
        return;
    }
    $("#player1-div").removeClass("border-warning");
    $("#player2-div").removeClass("border-warning");
    $("#turn-indicator").show().html("<p>Game Over!</p>");
    if(player1.choice === player2.choice) {
        $("#result-div").html("<h2>Tie Game!</h2>");
        return;
    }
    if((3 + player1.choice - player2.choice) % 3 === 1 ) {
        //player 1 wins
        $("#result-div").html("<h2>Player 1 Wins!");
        player1.wins ++;
        player2.losses ++;
        database.ref("players/player1").update({wins:player1.wins});
        database.ref("players/player2").update({losses:player2.losses});
        return;
    }
    //players 2 wins
    $("#result-div").html("<h2>Player 2 Wins!");
    player1.losses ++;
    player2.wins ++;
    database.ref("players/player2").update({wins:player2.wins});
    database.ref("players/player1").update({losses:player1.losses});
});

$("#player1-choices").on("click", ".choice", function(){
    database.ref("players/player1").update({choice:$(this).attr("val")}, ()=>{
        database.ref().update({turn:2});
    });
});

$("#player2-choices").on("click", ".choice", function(){
    database.ref("players/player2").update({choice:$(this).attr("val")}, ()=>{
        database.ref().update({turn:3}, function(){
            setTimeout(function(){
                database.ref().update({turn:1});
            },3000);
        });
    });
});

database.ref("players/player1").on("value", snapshot=>{
    player1 = snapshot.val();
    if(!player1){
        if(userPlayer===0) {
            $("#player-req-div").show();
            $("#player-div").hide();
        }
        $("#player1-name").html("<h4>Waiting for Player 1</h4>");
        $("#player1-stats").empty();
        return;
    }
    $("#player1-name").html("<h4>"+player1.name+"</h4>");
    $("#player1-stats").text("Wins: " + player1.wins + " Losses: " + player1.losses);
});

database.ref("players/player2").on("value", snapshot=>{
    player2 = snapshot.val();
    if(!player2){
        if(userPlayer===0) {
            $("#player-req-div").show();
            $("#player-div").hide();
        }
        $("#player2-name").html("<h4>Waiting for Player 2</h4>");
        $("#player2-stats").empty();
        return;
    }
    $("#player2-name").html("<h4>"+player2.name+"</h4>");4
    $("#player2-stats").text("Wins: " + player2.wins + " Losses: " + player2.losses);
});

$("#chat-form").submit(function(event) {
    event.preventDefault();
    var author = "Spectator";
    if(userPlayer===1) author = player1.name;
    if(userPlayer===2) author = player2.name;
    database.ref().update({
        chat: {
            "author": author,
            text: $("#chat-input").val()
        }
    });
    this.reset();
});

database.ref("chat").on("value", snapshot=>{
    if(!!snapshot.val()) {
        $("#chat-display").append("<p>" + snapshot.val().author + ": " + snapshot.val().text + "</p>");
        database.ref("chat").remove();
    }
});