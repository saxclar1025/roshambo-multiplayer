var config = {
    apiKey: "AIzaSyCAsHh9AA8FxJzCfXibfsbxur4BWHQJjCs",
    authDomain: "roshambo-3293b.firebaseapp.com",
    databaseURL: "https://roshambo-3293b.firebaseio.com",
    projectId: "roshambo-3293b",
    storageBucket: "roshambo-3293b.appspot.com",
    messagingSenderId: "715476833630"
  };
firebase.initializeApp(config);
var database = firebase.database();

const choices = ["Rock", "Paper", "Scissors"];

var Player = function(name){
    this.name = name;
    this.wins = 0;
    this.losses = 0;
    this.choice = null;
};

var gameUI = {
    $
};

var game = {
    players: [],

    addPlayer: function(name){
        if (this.players.length > 1) {
            return;
        }
        this.players.push(new Player(name));
    },

    removePlayer: function(n){
        this.players.splice(n,1);
    },

    evaluateChoices: function(){
        if(this.players[0].choice === this.players[1].choice) {
            //draw
        }
        if((3 + this.players[0].choice - this.players[1].choice) % 3 === 1 ) {
            //players[0] wins
        }
        else {
            //players[1] wins
        }
    }
};