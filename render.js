// render.js — Отрисовка игрового поля

const boardElement = document.getElementById("game-board"); // получаем элемент игрового поля из HTML

/* Функция для отрисовки игрового поля */
function drawBoard() {
  // создаем копию игрового поля, на которую временно "рисуем" активную тетромино
  const displayBoard = board.map(row => row.slice());

  // если есть активная тетромино, накладываем ее форму на копию поля
  if (currentTetromino) {
    const shape = currentTetromino.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) { // если ячейка заполнена
          const x = currentX + c;
          const y = currentY + r;
          // проверяем, что позиция ячейки находится в пределах поля, прежде чем рисовать
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            displayBoard[y][x] = currentTetromino.color;
          }
        }
      }
    }
  }

  // создаем HTML для всех ячеек поля
  let html = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cellValue = displayBoard[r][c];
      // если ячейка не пуста, добавляем класс, соответствующий ее цвету; иначе, класс по умолчанию
      const cellClass = cellValue !== 0 ? `cell color-${cellValue}` : "cell";
      html += `<div class="${cellClass}"></div>`;
    }
  }
  boardElement.innerHTML = html; // обновляем элемент поля новым HTML
}

// делаем функцию drawBoard доступной глобально (вызывается из update() в game.js)
window.drawBoard = drawBoard;
