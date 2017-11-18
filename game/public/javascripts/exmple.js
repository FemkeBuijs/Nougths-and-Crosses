var modal = {
    init: function () {
        this.cacheDom();
        this.addEventListener();
    },
    cacheDom: function () {
        this.el = document.querySelector(".modal");
        this.difficultyChoices = Array.prototype.slice.call(document.querySelectorAll(".modal-choice.difficulty"));
        this.tileChoices = Array.prototype.slice.call(document.querySelectorAll(".modal-choice.tile"));
        this.difficultyContainer = document.querySelector(".difficulty-container");
        this.tileChoiceContainer = document.querySelector(".choice-container");
    },
    show: function () {
        this.el.classList.add("show-modal");
    },
    hide: function () {
        this.el.classList.remove("show-modal");
    },
    hideDifficulty: function () {
        this.difficultyContainer.classList.add("hidden");
    },
    showTileChoice: function () {
        this.tileChoiceContainer.classList.remove("hidden");
    },
    addEventListener: function () {
        this.tileChoices.forEach(function (choice) {
            choice.addEventListener("click", game.tileChoice.bind(game));
        });
        this.difficultyChoices.forEach(function (choice) {
            choice.addEventListener("click", game.difficultyChoice.bind(game));
        });
    }
};


var game = {
    init: function () {
        this.board = [0,0,0,0,0,0,0,0,0];
        this.winPatterns = [
            [0,1,2], [3,4,5], [6,7,8],
            [0,3,6], [1,4,7], [2,5,8],
            [0,4,8], [2,4,6]
        ];
        this.PLAYER = 1;
        this.AI = 2;
        this.EMPTY = 0;
        this.PLAYER_TILE;
        this.DIFFICULTY;
        this.bestMove;
        this.isPlayerTurn = false;
        this.cacheDom();
        this.addEventListeners();
    },
    cacheDom: function () {
        this.squares = Array.prototype.slice.call(document.querySelectorAll(".square"));
        this.notification = document.querySelector(".notification");
    },
    renderBoard: function () {
        for (var i = 0; i < this.board.length; i++) {
            var tile = this.board[i];
            var el = this.squares[i];

            switch (tile) {
                case this.PLAYER:
                    tile = this.PLAYER_TILE;
                    break;
                case this.AI:
                    tile = (this.PLAYER_TILE === "X") ? "O" : "X";
                    break;
                case this.EMPTY:
                    tile = "";
                    break;
            }

            if (el.textContent !== tile) {
                el.textContent = tile;
            }
        }
    },
    tileChoice: function (e) {
        var choice = e.target.textContent;
        if (choice !== "X" && choice !== "O") {
            choice = "X";
        }
        this.PLAYER_TILE = choice;
        modal.hide();
        stats.show();
        setTimeout(function () {
            this.startGame();
        }.bind(this), 200);
    },
    difficultyChoice: function (e) {
        var difficulty = e.target.textContent;
        if (difficulty !== "EASY" && difficulty !== "HARD") {
            difficulty = "HARD";
        }

        this.DIFFICULTY = difficulty;
        modal.hideDifficulty();
        modal.showTileChoice();
    },
    addEventListeners: function () {
        this.squares.forEach(function (square) {
            square.addEventListener("click", this.playerMove.bind(this));
        }.bind(this));
    },
    startGame: function () {
        if (this.PLAYER_TILE === "X") {
            this.isPlayerTurn = true;
        } else {
            this.aiTurn();
        }
    },
    notificate: function (msg) {
        this.notification.classList.toggle("show");
        this.notification.textContent = msg;
    },
    clearSquareClasses: function () {
        this.squares.forEach(function (square) {
            if (square.classList.contains("player")) {
                square.classList.remove("player");
            }
        });
    },
    playerMove: function (e) {
        if (e.target.textContent || !this.isPlayerTurn) {
            return;
        }

        this.isPlayerTurn = false;
        var i = Array.prototype.indexOf.call(this.squares, e.target);
        this.board[i] = this.PLAYER;
        e.target.classList.add("player");
        this.renderBoard();
        if (!this.isOver()) {
            setTimeout(function () {
                this.aiTurn();
            }.bind(this), 200);
        } else {
            this.newGame();
        }
    },
    checkVictory: function (player, board) {
        return this.winPatterns.some(function (pattern) {
            return pattern.every(function (tile) {
                return board[tile] === player;
            }.bind(this));
        }.bind(this));
    },
    isFull: function (board) {
        return board.every(function (tile) {
            return tile !== this.EMPTY;
        }.bind(this));
    },
    availableMoves: function (board) {
        return board.reduce(function (free, tile, i) {
            if (tile === this.EMPTY) {
                free.push(i);
            }
            return free;
        }.bind(this), []);
    },
    minimax: function (board, player, depth) {
        if (this.checkVictory(this.AI, board)) {
            return 10 - depth;
        } else if (this.checkVictory(this.PLAYER, board)) {
            return depth - 10;
        } else if (this.isFull(board)) {
            return 0;
        }

        ++depth;
        var scores = [];
        var moves = [];
        var opponent = (player === this.AI) ? this.PLAYER : this.AI;

        var availableMoves = this.availableMoves(board);
        availableMoves.forEach(function (move) {
            board[move] = player;
            scores.push(this.minimax(board, opponent, depth));
            moves.push(move);
            board[move] = this.EMPTY;
        }.bind(this));

        if (player === this.AI) {
            var bestScore = -Number.MAX_VALUE;
            for (var i = 0; i < scores.length; i++) {
                if (scores[i] > bestScore) {
                    bestScore = scores[i];
                    this.bestMove = moves[i];
                }
            }
            return bestScore;
        } else {
            var bestScore = Number.MAX_VALUE;
            for (var i = 0; i < scores.length; i++) {
                if (scores[i] < bestScore) {
                    bestScore = scores[i];
                    this.bestMove = moves[i];
                }
            }
            return bestScore;
        }
    },
    isOver: function () {
        return this.isFull(this.board) || this.checkVictory(this.AI, this.board) || this.checkVictory(this.PLAYER, this.board);
    },
    aiTurn: function () {
        if (this.DIFFICULTY === "HARD") {
            this.minimax(this.board, this.AI, 0);
            this.board[this.bestMove] = this.AI;
        } else {
            var moves = this.availableMoves(this.board);
            var move = moves[Math.floor(Math.random() * moves.length)];
            this.board[move] = this.AI;
        }
        this.renderBoard();
        if (!this.isOver()) {
            setTimeout(function () {
                this.isPlayerTurn = true;
            }.bind(this), 200);
        } else {
            this.newGame();
        }
    },
    getWinner: function () {
        if (this.checkVictory(this.AI, this.board)) {
            return this.AI;
        } else if (this.checkVictory(this.PLAYER, this.board)) {
            return this.PLAYER;
        } else {
            return "DRAW";
        }
    },
    getWinPattern: function (player) {
        return this.winPatterns.filter(function (pattern) {
            return pattern.every(function (tile) {
                return this.board[tile] === player;
            }.bind(this));
        }.bind(this))[0];
    },
    highlightPattern: function () {
        var winner = this.getWinner();
        if (winner === "DRAW") {
            return;
        }

        var pattern = this.getWinPattern(winner);
        pattern.forEach(function (tile) {
            this.squares[tile].classList.add("highlight");
        }.bind(this));

        setTimeout(function () {
            pattern.forEach(function (tile) {
                this.squares[tile].classList.remove("highlight");
            }.bind(this));
        }.bind(this), 1750);
    },
    newGame: function () {
        var winner = this.getWinner();
        var msg;
        this.highlightPattern();
        switch (winner) {
            case this.AI:
                msg = "You lost!";
                break;
            case this.PLAYER:
                msg = "You won!";
                break;
            case "DRAW":
                msg = "It's a draw!";
                break;
        }
        stats.increment(winner);
        this.notificate(msg);
        this.reset();
    },
    reset: function () {
        setTimeout(function () {
            this.board = [0,0,0,0,0,0,0,0,0];
            this.clearSquareClasses();
            this.bestMove = null;
            this.notificate("");
            this.renderBoard();
            if (this.PLAYER_TILE === "X") {
                this.isPlayerTurn = true;
            } else {
                setTimeout(function () {
                    this.aiTurn();
                }.bind(this), 200);
            }
        }.bind(this), 2000);
    }
};

var stats = {
    init: function () {
        this.cacheDom();
        this.player = 0;
        this.opp = 0;
        this.draw = 0;
    },
    cacheDom: function () {
        this.el = document.querySelector(".stats");
        this.playerEl = document.querySelector(".stats .player");
        this.oppEl = document.querySelector(".stats .opponent");
        this.drawEl = document.querySelector(".stats .draw");
    },
    show: function () {
        this.el.style.display = "flex";
    },
    increment: function (player) {
        switch (player) {
            case 1:
                this.player++
                this.playerEl.textContent = this.player;
                break;
            case 2:
                this.opp++
                this.oppEl.textContent = this.opp;
                break;
            case "DRAW":
                this.draw++
                this.drawEl.textContent = this.draw;
                break;
        }
    }
};

game.init();
modal.init();
stats.init();
window.onload = modal.show.bind(modal);