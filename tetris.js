// 'use strick';
const cvs  = document.getElementById('tetris');
const ctx  = cvs.getContext('2d');
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = COLUMN = 10;
const SQ  = SQUARE =  20;
const VACANT = 'WHITE'; // color of an empty square

// draw a square
//x cordinate, y cordinate

function drawSquare(x, y, color){
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ)

    ctx.strokeStyle = 'BLACK';
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ)
}

// create the board

let board = [];
for (r = 0; r < ROW; r++){
    board[r] = [];
    for ( c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
}

// console.log(board);

function drawBoard() {
    for ( r = 0; r < ROW; r++) {
        for ( c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c])
        }
    }   
}

drawBoard();

// the pieces and their colors

const PIECES = [
    [Z, "red"],
    [S, "green"],
    [T, "yellow"],
    [O, "blue"],
    [L, "purple"],
    [I, "cyan"],
    [J, "orange"],
];

// generate random piece
function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length); // returns number between 0 and 6
    return  new Piece(PIECES[r][0], PIECES[r][1]);

}

let p = randomPiece();
// console.log(p);
//the Object Piece

function Piece(tetromino, color) {
    this.tetromino = tetromino
    this.color = color;

    this.tetrominoN = 0; //tetromino number we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];

    //we need to control the pieces
    this.x = 3;
    this.y = -2
}

Piece.prototype.fill = function (color) {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            // we draw only occupied squares
            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}
// draw a piece t draw the piece 
Piece.prototype.draw = function(){
    this.fill(this.color)   
}


//undraw piece
Piece.prototype.unDraw = function(){
    this.fill(VACANT)
}

// move down the piece 

Piece.prototype.moveDown = function (){
    if(!this.collision(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else {
        this.lock();
        p = randomPiece();
    }
}

// move Rigth the piece 
Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// move down the piece 
Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// move down the piece 

Piece.prototype.rotate = function () {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length]
    let kick = 0;

    if (this.collision(0, 0, nextPattern)){
        if(this.x > COL/2){
            //its the right wall 
            kick = -1 //kick piece to the left
        }else{
            kick = 1 //kick piece to the right
            //its the left wall
        }
    }
    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;
Piece.prototype.lock = function (){
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            // we skip vacant squares
            if (!this.activeTetromino[r][c]) {
                continue;
            }
            if(this.y + r < 0){
                alert("Game Over");
                //stop request animation frame
                gameOver = true;
                break; 
            }
            //we lock the piece
            board[this.y + r][this.x + c] = this.color
        }
    }
    // return
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for(c=0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != VACANT)
        }
        if (isRowFull) {
            for(y =r; y > 1; y--){
                for (c = 0; c < COL; c++){
                    board[y][c] = board[y - 1] [c]
                }
            }
            for (c = 0; c < COL; c++) {
                board[0][c] = VACANT
            }
            // increment the score
            score += 10;
        }
    }
    //update the board
    drawBoard();

    scoreElement.innerHTML = score;

}

Piece.prototype.collision = function (x,y, piece){
    for (r = 0; r < piece.length; r++) {
        for (c = 0; c < piece.length; c++) {
            // if the square is empty, skip it
            if(!piece[r][c]){
                continue;
            }
            // coordinate of the piece after the movement
            let newX = this.x + c + x
            let newY = this.y + r + y

            //conditions
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            //skip newY < 0; board[-1] will crash the game
            if(newY < 0){
                continue;
            }
            //check if there is a locked piece  already in play
            if(board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

document.addEventListener("keydown", control);

function control(event){
    if(event.keyCode == 37){
        p.moveLeft();
        // dropStart = Date.now()
    }
    else if (event.keyCode == 38){
        p.rotate()
        // dropStart = Date.now()
    }
    else if (event.keyCode == 39){
        p.moveRight();
        // dropStart = Date.now()
    }
    else if (event.keyCode == 40){
        p.moveDown()
    }
}

//control the piece

let dropStart = Date.now()
let gameOver = false;

// drop the piece every 1sec
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000){
        p.moveDown();
        dropStart = Date.now();
    }
    if(!gameOver) {
        requestAnimationFrame(drop);
    }
}

drop();