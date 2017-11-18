var socket = io.connect('http://localhost:2000');

var game = {
    patternX: [],
    patternO: [],
    currentPlayer: 'X',
    moves: 0,
    winner: false
};

var current_square = null;
var current_id = null;
var winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];
var winningArray =[];

$('.square').on('click', function(){
    if (!$(this).hasClass('clicked')) {
        current_square = $(this);
        current_id = current_square.attr('id');
        player();
        game.moves++;
    }
});

socket.on('message-from-server', function(data){
    $('<p>' + data + '</p>').appendTo(current_square);
    current_square.addClass('clicked');
});

function player(){
    if (game.currentPlayer === 'X') {
        socket.emit('message-from-client', 'X' );
        game.currentPlayer = 'O';
        game.patternX.splice(_.sortedIndex(game.patternX, current_id), 0, parseInt(current_id));
        checkWinner(game.patternX, winPatterns, function(err, isWinner, winningArray){
            if(err) {
                console.log(err);
            } else if (isWinner){
                highlightPattern(winningArray)
            }
        });
    } else {
        socket.emit('message-from-client', 'O' );
        game.currentPlayer = 'X';
        game.patternO.splice(_.sortedIndex(game.patternO, current_id), 0, parseInt(current_id));
        checkWinner(game.patternO, winPatterns, function(err, isWinner, winningArray){
            if(err) {
                console.log(err);
            } else if (isWinner){
                highlightPattern(winningArray)
            }
        });
    }
}

function checkWinner(player, winnerPatterns, callback){
    game.winner = winnerPatterns.some(function(array){
        return array.every(function(number){
            winningArray = array;
            return player.indexOf(number) !== -1;
        });
    });
    if(game.winner) {
        callback(null, game.winner, winningArray);
    }
}

function highlightPattern(winningArray){
    if(game.winner) {
        for (var i = 0; i < winningArray.length; i++) {
            $('#' + winningArray[i]).addClass('winner');
        }
        setTimeout(reset, 1500);
    }
}

function reset(){
    $('.square.clicked').removeClass('clicked');
    $('.winner').removeClass('winner');
    $('.square').html('').bind('click', function(){
        //console.log('clicked!')
    });
    game.moves=0;
    game.winner=false;
    game.patternO = [];
    game.patternX= [];
    game.currentPlayer= 'X';
}