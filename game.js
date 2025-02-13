// game.js — Main game logic

const ROWS = 20; // number of rows on the board
const COLS = 10; // number of columns on the board
let board = []; // game board as a 2D array
let currentTetromino = null; // current falling tetromino
let currentX = 0; // current x position of tetromino on board
let currentY = 0; // current y position of tetromino on board
let dropInterval = 500; // drop interval in milliseconds
let dropCounter = 0; // counter to track drop timing
let lastTime = 0; // last update time (for delta calculation)
let animationFrameId; // id for animation frame, for canceling if needed
let gameOver = false; // flag to indicate if the game is over

/* create an empty board */
function createBoard() {
  board = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = 0; // 0 means empty cell
    }
  }
}

/* define tetrominoes including their shapes and color codes */
const tetrominoes = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: 1,
  },
  J: {
    shape: [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0],
    ],
    color: 2,
  },
  L: {
    shape: [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ],
    color: 3,
  },
  O: {
    shape: [
      [4, 4],
      [4, 4],
    ],
    color: 4,
  },
  S: {
    shape: [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ],
    color: 5,
  },
  T: {
    shape: [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0],
    ],
    color: 6,
  },
  Z: {
    shape: [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ],
    color: 7,
  },
};

/* randomly select a tetromino */
function randomTetromino() {
  const keys = Object.keys(tetrominoes);
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  const piece = tetrominoes[randKey];
  // clone the shape matrix to avoid modifying the original
  const shape = piece.shape.map((row) => row.slice());
  return { shape: shape, color: piece.color };
}

/* spawn a new tetromino */
function spawnTetromino() {
  currentTetromino = randomTetromino();
  currentY = 0;
  // center the tetromino horizontally on the board
  currentX = Math.floor((COLS - currentTetromino.shape[0].length) / 2);
  // if the tetromino cannot be placed at the starting position then end game
  if (!isValidPosition(currentTetromino.shape, currentX, currentY)) {
    gameOver = true;
    cancelAnimationFrame(animationFrameId);
    resetScore();
    alert("Game Over!");
  }
}

/* check if tetromino can be placed at given offset */
/* this is a simple collision detection and boundary check */
function isValidPosition(shape, offsetX, offsetY) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const newX = offsetX + c;
        const newY = offsetY + r;
        // check left, right and bottom boundaries
        if (newX < 0 || newX >= COLS || newY >= ROWS) {
          return false;
        }
        // check for collisions with settled tetrominoes; newY can be negative at spawn
        if (newY >= 0 && board[newY][newX] !== 0) {
          return false;
        }
      }
    }
  }
  return true;
}

/* merge the current tetromino into the board */
function mergeTetromino() {
  const shape = currentTetromino.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        // assign the tetromino's color to the board cell
        board[currentY + r][currentX + c] = currentTetromino.color;
      }
    }
  }
}
function updateScore(amount) {
  let currentScore = Number(document.getElementById("totalScore").innerHTML);
  let updatedScore = currentScore + amount;
  document.getElementById("totalScore").innerHTML = updatedScore;
}
/* clear full lines from the board */
function clearLines() {
  for (let r = ROWS - 1; r >= 0; r--) {
    // if every cell in the row is filled (non-zero)
    if (board[r].every((cell) => cell !== 0)) {
      board.splice(r, 1); // remove the filled row
      board.unshift(new Array(COLS).fill(0)); // add an empty row at the top
      r++; // re-check the same row index since board has shifted
      updateScore(100); //update score - if line removed
    }
  }
}

function resetScore() {
  document.getElementById("totalScore").innerHTML = 0;
}

/* rotate a tetromino's matrix clockwise */
function rotate(matrix) {
  const N = matrix.length;
  const result = [];
  for (let i = 0; i < N; i++) {
    result[i] = [];
    for (let j = 0; j < N; j++) {
      // rotate element from bottom-left position to top-right position
      result[i][j] = matrix[N - j - 1][i];
    }
  }
  return result;
}

/* move current tetromino by a given offset; return true if movement is valid */
function move(offsetX, offsetY) {
  if (
    isValidPosition(
      currentTetromino.shape,
      currentX + offsetX,
      currentY + offsetY
    )
  ) {
    currentX += offsetX;
    currentY += offsetY;
    return true;
  }
  return false;
}

/* drop the current tetromino one step down */
/* if tetromino cannot move down further then merge it into board */
function drop() {
  if (!move(0, 1)) {
    mergeTetromino();
    clearLines();
    spawnTetromino();
  }
  dropCounter = 0; // reset drop counter after a drop
}

/* main game loop using requestAnimationFrame */
/* it updates game state and redraws board at each frame */
function update(time = 0) {
  const deltaTime = time - lastTime; // calculate time elapsed since last frame
  lastTime = time;
  dropCounter += deltaTime;
  // drop tetromino if accumulated time exceeds interval
  if (dropCounter > dropInterval) {
    drop();
  }
  drawBoard(); // draw the board; function defined in render.js
  if (!gameOver) {
    animationFrameId = requestAnimationFrame(update);
  }
}

function waitForVar() {
  const interval = setInterval(() => {
    if (Number(document.getElementById("totalScore").innerHTML) === 200) {
      updateSpeed();
    }
  }, 100);
}

waitForVar();

function updateSpeed() {
  dropInterval = 200;
}

/* start the game on clicking the start button */
document.getElementById("startButton").addEventListener("click", () => {
  resetScore();
  gameOver = false;
  createBoard();
  spawnTetromino();
  lastTime = 0;
  dropCounter = 0;
  update(); // begin the game loop
});
