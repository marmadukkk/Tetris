// render.js — Rendering the game board

const boardElement = document.getElementById("game-board"); // retrieve the board element from HTML

function drawBoard() {
  // make a copy of the board where we temporarily "draw" the active tetromino
  const displayBoard = board.map(row => row.slice());

  // if there is an active tetromino, overlay its shape onto the board copy
  if (currentTetromino) {
    const shape = currentTetromino.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) { // if cell is filled
          const x = currentX + c;
          const y = currentY + r;
          // ensure cell position is within board boundaries before drawing
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            displayBoard[y][x] = currentTetromino.color;
          }
        }
      }
    }
  }

  // build HTML for all board cells
  let html = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cellValue = displayBoard[r][c];
      // if cell is not empty, add a class that represents its color; else, default cell class
      const cellClass = cellValue !== 0 ? `cell color-${cellValue}` : "cell";
      html += `<div class="${cellClass}"></div>`;
    }
  }
  boardElement.innerHTML = html; // update the board element with new HTML
}

// make the drawBoard function globally accessible (called from update() in game.js)
window.drawBoard = drawBoard;