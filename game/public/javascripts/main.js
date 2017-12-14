var socket = io.connect('http://localhost:2000');

var game = {
    currentPlayer: 'X',
    moves: 0,
    winner: false
};

var patternX = [];
var patternO = [];
var current_id = null;
var current_pattern = patternX;
var winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];
var winningArray =[];
var draw = 0;
var Xwinnings = 0;
var Ywinnings = 0;

$('.square').on('click', function(){
    //check if the clicked tile does not already have a class 'clicked'
    if (!$(this).hasClass('clicked')) {
        //set the tile id
        current_id = $(this).attr('id');
        player(current_id);
        game.moves++;
    }
});

function player(current_tile){
    //send message to the server with the current player and current tile id
    socket.emit('message-from-client', { player: game.currentPlayer, tile: current_tile });
    //insert the tile id into the current pattern array, but in its chronological place using Lodash sortedIndex      //to find the correct index (the 0 means delete nothing in the array)
    current_pattern.splice(_.sortedIndex(current_pattern, current_id), 0, parseInt(current_id));

    checkWinner(current_pattern, winPatterns, function(err, isWinner, winningArray){
        if(err) {
            console.log(err);
        } else if (isWinner){
            highlightPattern(winningArray)
        }
    });
}

socket.on('set-tile-from-server', function(tile_id, data) {
    //add a clicked class to the tiles as to avoid the tile value to be changed, and insert the data value
    $('#' + tile_id).addClass('clicked').text(data);
    //change player based on previous player
    if (data === 'X') {
        $('.playerTurn').text('O');
        game.currentPlayer = 'O';
        current_pattern = patternO;
    } else {
        $('.playerTurn').text('X');
        game.currentPlayer = 'X';
        current_pattern = patternX;
    }
});

function checkWinner(playerPattern, winnerPatterns, callback){
    //check if at least one pattern in the winnerPatterns passes the test
    game.winner = winnerPatterns.some(function(winArray){
        //return true if every number the current winArray can be found in the playerPattern array
        return winArray.every(function(number){
            winningArray = winArray;
            //return true if checking the index of the current winning number does not equal -1
            return playerPattern.indexOf(number) !== -1;
        });
    });
    if(game.winner) {
        //if there is a winner, activate the callback by sending the winningArray back
        callback(null, game.winner, winningArray);
        //update the scoreboard by sending the information to the server based on winner
        if(game.currentPlayer === 'X'){
            Xwinnings = Xwinnings + 1;
            socket.emit('update-scorebord-from-client', {outcome: 'Winner: Player X', class: '.playerX', result: Xwinnings});
        } else {
            Ywinnings = Ywinnings + 1;
            socket.emit('update-scorebord-from-client', {outcome: 'Winner: Player O', class: '.playerO', result: Ywinnings});
        }
        //else if there is no winner and the game had the maximum moves, send draw to server
    } else if (game.moves > 7){
        setTimeout(reset, 1500);
        draw = draw + 1;
        socket.emit('update-scorebord-from-client', {outcome: 'Draw', class: '.draw', result: draw});
    }
}

//update the scoreboard and notification based on outcome
socket.on('update-scorebord-from-server', function(data){
    $(data.class).text(data.result);
    $('.notification').text(data.outcome).addClass('show');
});


function highlightPattern(winningArray){

    if(game.winner) {
        //if there is a winner, get the individual id's and add the highlight class
        for (var i = 0; i < winningArray.length; i++) {
            $('#' + winningArray[i]).addClass('highlight');
        }
        //add the clicked class to all tiles so that the game cannot be continued
        $('.square').addClass('clicked');
        //Timeout before the reset function is called
        setTimeout(reset, 1500);
    }
}

function reset(){
    //send reset information to server
    socket.emit('reset-from-client', {clicked: '.square.clicked', highlight: '.highlight', html: '.square'} );
}

socket.on('reset-from-server', function(clicked, highlight, html){
    //on receiving the reset information from the server, update the board and variables
    $(clicked).removeClass('clicked');
    $(highlight).removeClass('highlight');
    $('.notification').removeClass('show');
    $(html).html('');
    game.moves=0;
    game.winner=false;
    patternO = [];
    patternX= [];
    game.currentPlayer= 'X';
    current_pattern= patternX;
});