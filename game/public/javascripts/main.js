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
    if (!$(this).hasClass('clicked')) {
        current_id = $(this).attr('id');
        player(current_id);
        game.moves++;
    }
});

socket.on('set-tile-from-server', function(tile_id, data) {
    $('#' + tile_id).addClass('clicked').append('<p>' + data + '</p>');

    if (data === 'X') {
        game.currentPlayer = 'O';
        current_pattern = patternO;
    } else {
        game.currentPlayer = 'X';
        current_pattern = patternX;
    }
});

function player(current_tile){
    socket.emit('message-from-client', { player: game.currentPlayer, tile: current_tile });
    current_pattern.splice(_.sortedIndex(current_pattern, current_id), 0, parseInt(current_id));
    checkWinner(current_pattern, winPatterns, function(err, isWinner, winningArray){
        if(err) {
            console.log(err);
        } else if (isWinner){
            highlightPattern(winningArray)
        }
    });
}

function checkWinner(playerPattern, winnerPatterns, callback){
    game.winner = winnerPatterns.some(function(array){
        return array.every(function(number){
            winningArray = array;
            return playerPattern.indexOf(number) !== -1;
        });
    });
    if(game.winner) {
        callback(null, game.winner, winningArray);
        if(game.currentPlayer === 'X'){
            Xwinnings = Xwinnings + 1;
            socket.emit('update-scorebord-from-client', {outcome: '.playerX', result: Xwinnings});
        } else {
            Ywinnings = Ywinnings + 1;
            socket.emit('update-scorebord-from-client', {outcome: '.playerO', result: Ywinnings});
        }
    } else if (game.moves > 7){
        setTimeout(reset, 1500);
        draw = draw + 1;
        socket.emit('update-scorebord-from-client', {outcome: '.draw', result: draw});
    }
}

socket.on('update-scorebord-from-server', function(data){
    $(data.outcome).text(data.result);
});

function highlightPattern(winningArray){
    if(game.winner) {
        for (var i = 0; i < winningArray.length; i++) {
            $('#' + winningArray[i]).addClass('highlight');
        }
        $('.square').addClass('clicked');
        setTimeout(reset, 1500);
    }
}

function reset(){
    socket.emit('reset-from-client', {clicked: '.square.clicked', highlight: '.highlight', html: '.square'} );
}

socket.on('reset-from-server', function(clicked, highlight, html){
    $(clicked).removeClass('clicked');
    $(highlight).removeClass('highlight');
    $(html).html('');
    game.moves=0;
    game.winner=false;
    patternO = [];
    patternX= [];
    game.currentPlayer= 'X';
    current_pattern= patternX;
});