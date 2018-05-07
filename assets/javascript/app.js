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
    this.choice = null;
}

var gameUI = {
    $playerName: i => {return $("#player" + i + "-name");},
    $playerChoices: i => {return $("#player" + i + "-choices");},
    $playerStats: i => {return $("#player" + i + "-stats");},
    $playerDiv: i => {return $("#player" + i + "-div");},

    user: 0,
    
    updateUser: function(player) {
        $("#player-req-div").hide()
        if(this.user === 0){
            $("#player-div").html("<p>Spectator mode</p>");
            return;
        }
        $("#player-div").html("<p>Hi " + player.name + "! You are Player " + this.user + "</p>").show();
    },

    requestUser: function() {
        $("#player-div").hide();
        $("#player-req-div").show();
    },

    updateTurnIndicator: function(isTurn, opponent) {
        $("#turn-indicator").show();
        if(isTurn) {
            $("#turn-indicator").html("<p>It's Your Turn!</p>");
            return;
        }
        $("#turn-indicator").html("<p>Waiting for " + opponent.name + " to choose.</p>");
    },

    setTurnIndicatorToSpectator: function() {
        $("#turn-indicator").show().html("<p>Spectator Mode</p>");
    },

    updateTurnColor: function(n) {
        this.$playerDiv(1).removeClass("border-warning");
        this.$playerDiv(2).removeClass("border-warning");
        if(n===0) return;
        this.$playerDiv(n).addClass("border-warning");
    },

    clearTurnIndicator: function() {
        $("#turn-indicator").hide();
    },

    displayWaitingForPlayer: function(i) {
        this.$playerName(i).html("<h4>Waiting for Player " + i + "</h4>");
        this.$playerChoices(i).empty();
        this.$playerStats(i).empty();
    },

    displayPlayer: function(i, player) {
        this.$playerName(i).html("<h4>" + player.name + "</h4>");
        this.$playerStats(i).text("Wins: " + player.wins + " Losses: " + player.losses);
    },

    displayChoices: function(i) {
        this.$playerChoices(i).empty()
        .append($("<p class='choice' val=0>" + choices[0] + "</p>"))
        .append($("<p class='choice' val=1>" + choices[1] + "</p>"))
        .append($("<p class='choice' val=2>" + choices[2] + "</p>"));
    },

    displaySelection: function(i, sel) {
        this.$playerChoices(i).html("<h4 class='selection'>" + choices[sel] + "</h4>");
    },

    clearChoices: function(i) {
        this.$playerChoices(i).empty();
    },

    displayWinner: function(player) {
        $("#result-div").html("<h2>" + player.name + " Wins!</h2>");
    },

    displayTie: function() {
        $("#result-div").html("<h2>Tie Game!</h2>");
    }
}

var game = {
    players: {},
    turn: 0,

    addPlayer: function(name){
        if (!this.players[1]) {
            database.ref("players").update({1:new Player(name)}, ()=>{
                gameUI.updateUser(game.players[1]);
            });
            gameUI.user = 1;
            return;
        }

        if(!this.players[2]) {
            database.ref("players").update({2:new Player(name)}, ()=>{
                gameUI.updateUser(game.players[2]);
            });
            gameUI.user = 2;
            return;
        }
        console.log("Already have 2 players");
    },

    removePlayer: function(n){
        if(!!this.players[n]) {
            delete this.players[n];
            gameUI.displayWaitingForPlayer(n);
            if(gameUI.user === 0) {
                gameUI.requestUser();
            }
            this.stopGame();
            return;
        }
        console.log("Player does not exist, cannot be removed");
    },

    stopGame: function() {
        this.turn = 0;
        gameUI.updateTurnColor(0);
        gameUI.clearTurnIndicator();
        gameUI.clearChoices(1);
        gameUI.clearChoices(2);
    },

    startGame: function() {
        if(!this.players[1] || !this.players[2]) {
            console.log("Cannot start game, don't have both players");
            return;
        }
        database.ref().set({turn:1});
        gameUI.updateTurnColor(1);
        if(gameUI.user === 1) {
            gameUI.updateTurnIndicator(true);
            gameUI.displayChoices(1);
            return;
        }
        gameUI.updateTurnIndicator(false, this.players[1]);
    },

    startTurn: function(n) {
        gameUI.updateTurnColor(n);
        if(gameUI.user != 0) gameUI.displayChoices(n);
        gameUI.updateTurnIndicator(n === gameUI.user, this.players[(gameUI.user%2)+1]);
    },

    setChoice: function(choice){
        if(!this.players[1] || !this.players[2]) {
            console.log("Cannot set choices, don't have both players");
            return;
        }
        database.ref("players/" + this.turn).update({"choice":choice});
        database.ref("turn").set(this.turn + 1);
    },

    evaluateChoices: function(){
        if(!this.players[1] || !this.players[2]) {
            console.log("Cannot evaluate choices, don't have both players");
            return;
        }
        if(this.players[1].choice === this.players[2].choice) {
            //draw
            gameUI.displayTie();
            return;
        }
        if((3 + this.players[1].choice - this.players[2].choice) % 3 === 1 ) {
            //player 1 wins
            gameUI.displayWinner(this.players[1]);
            database.ref("players/1").update({wins:this.players[1].wins + 1});
            database.ref("players/2").update({losses:this.players[2].losses + 1});
            return;
        }
        //players 2 wins
        gameUI.displayWinner(this.players[2]);
        database.ref("players/2").update({wins:this.players[2].wins + 1});
        database.ref("players/1").update({losses:this.players[1].losses + 1});
    }
}

database.ref("players").on("value", snapshot=>{
    if(!snapshot.val()) return;
    game.players = snapshot.val();
    if(!!game.players[1]) {
        gameUI.displayPlayer(1, game.players[1]);
    }
    if(!!game.players[2]) {
        gameUI.displayPlayer(2, game.players[2]);
    }
    game.startGame();
});

database.ref("turn").on("value", snapshot=>{
    if(!snapshot.val()){
        game.turn = 0;
        return;
    }
    game.turn = snapshot.val();
    game.startTurn(snapshot.val());
});

database.ref("turn").onDisconnect().remove();

$("#name-form").submit(event=>{
    event.preventDefault();
    game.addPlayer($("#name-input").val());
    database.ref("players/" + gameUI.user).onDisconnect().remove();
});

$("#player1-choices").on("click", ".choice", ()=>{
    console.log($(this).attr("val"));
    game.setChoice($(this).attr("val"));
});

$("#player2-choices").on("click", ".choice", ()=>{
    console.log($(this).attr("val"));
    game.setChoice($(this).attr("val"));
});