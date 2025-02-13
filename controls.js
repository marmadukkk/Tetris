// controls.js — Key press handling

// listen for keydown events in the document
document.addEventListener("keydown", (event) => {
  // if game over or no active tetromino, ignore key presses
  if (gameOver || !currentTetromino) return;

  // determine action based on pressed key code
  switch (event.code) {
    case "ArrowLeft":
      // move tetromino left
      move(-1, 0);
      break;
    case "ArrowRight":
      // move tetromino right
      move(1, 0);
      break;
    case "ArrowDown":
      // speed up drop of tetromino
      drop();
      break;
    case "ArrowUp":
      // attempt to rotate tetromino clockwise
      const rotated = rotate(currentTetromino.shape);
      // if rotated shape fits in the current position then update
      if (isValidPosition(rotated, currentX, currentY)) {
        currentTetromino.shape = rotated;
      }
      break;
  }
});