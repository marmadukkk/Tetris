// controls.js — Key press handling

// listen for keydown events in the document
document.addEventListener("keydown", (event) => {
  if (gameOver || !currentTetromino) return;

  switch (event.code) {
    case "ArrowLeft":
      move(-1, 0);
      break;
    case "ArrowRight":
      move(1, 0);
      break;
    case "ArrowDown":
      drop();
      break;
    case "ArrowUp":
      const rotated = rotate(currentTetromino.shape);
      if (isValidPosition(rotated, currentX, currentY)) {
        currentTetromino.shape = rotated;
      }
      break;
  }
});
