// game.js — Основная логика игры

const ROWS = 20; // количество строк на игровом поле
const COLS = 10; // количество столбцов на игровом поле
let board = []; // игровое поле в виде двумерного массива
let currentTetromino = null; // текущая падающая тетромино
let currentX = 0; // текущая позиция тетромино по оси X на поле
let currentY = 0; // текущая позиция тетромино по оси Y на поле
let dropInterval = 500; // интервал падения в миллисекундах
let dropCounter = 0; // счетчик для отслеживания времени падения
let lastTime = 0; // время последнего обновления (для расчета дельты)
let animationFrameId; // идентификатор анимационного кадра, для отмены при необходимости
let gameOver = false; // флаг, указывающий, завершена ли игра

/* Создание пустого игрового поля */
function createBoard() {
  board = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = 0; // 0 означает пустую ячейку
    }
  }
}

/* Определение тетромино, включая их формы и цветовые коды */
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

/* Случайный выбор тетромино */
function randomTetromino() {
  const keys = Object.keys(tetrominoes);
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  const piece = tetrominoes[randKey];
  // клонируем матрицу формы, чтобы избежать изменения оригинала
  const shape = piece.shape.map((row) => row.slice());
  return { shape: shape, color: piece.color };
}

/* Появление новой тетромино */
function spawnTetromino() {
  currentTetromino = randomTetromino();
  currentY = 0;
  currentX = Math.floor((COLS - currentTetromino.shape[0].length) / 2);
  if (!isValidPosition(currentTetromino.shape, currentX, currentY)) {
    gameOver = true;
    cancelAnimationFrame(animationFrameId);
    resetScore();
    showGameOverPopup(); // Показываем pop-up при проигрыше
  }
}

/* Показ pop-up окна при завершении игры */
function showGameOverPopup() {
  const popup = document.getElementById("gameOverPopup");
  const finalScore = document.getElementById("finalScore");
  finalScore.textContent = document.getElementById("totalScore").textContent;
  popup.style.display = "flex";
}

/* Скрытие pop-up окна */
function hideGameOverPopup() {
  const popup = document.getElementById("gameOverPopup");
  popup.style.display = "none";
}

// Добавление обработчика для кнопки Restart
document.getElementById("restartButton").addEventListener("click", () => {
  hideGameOverPopup();
  resetScore();
  gameOver = false;
  createBoard();
  spawnTetromino();
  lastTime = 0;
  dropCounter = 0;
  update();
});

/* Проверка, может ли тетромино быть размещено с заданным смещением */
/* Это простая проверка на столкновения и границы */
function isValidPosition(shape, offsetX, offsetY) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const newX = offsetX + c;
        const newY = offsetY + r;
        // проверка левой, правой и нижней границ
        if (newX < 0 || newX >= COLS || newY >= ROWS) {
          return false;
        }
        // проверка на столкновения с установленными тетромино; newY может быть отрицательным при появлении
        if (newY >= 0 && board[newY][newX] !== 0) {
          return false;
        }
      }
    }
  }
  return true;
}

/* Объединение текущей тетромино с игровым полем */
function mergeTetromino() {
  const shape = currentTetromino.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        // присваиваем ячейке поля цвет тетромино
        board[currentY + r][currentX + c] = currentTetromino.color;
      }
    }
  }
}

/* Обновление счета */
function updateScore(amount) {
  let currentScore = Number(document.getElementById("totalScore").innerHTML);
  let updatedScore = currentScore + amount;
  document.getElementById("totalScore").innerHTML = updatedScore;
}

/* Очистка заполненных линий на поле */
function clearLines() {
  for (let r = ROWS - 1; r >= 0; r--) {
    // если каждая ячейка в строке заполнена (не равна нулю)
    if (board[r].every((cell) => cell !== 0)) {
      board.splice(r, 1); // удаляем заполненную строку
      board.unshift(new Array(COLS).fill(0)); // добавляем пустую строку вверху
      r++; // повторно проверяем тот же индекс строки, так как поле сместилось
      updateScore(100); // обновляем счет, если линия удалена
    }
  }
}

/* Сброс счета */
function resetScore() {
  document.getElementById("totalScore").innerHTML = 0;
}

/* Поворот матрицы тетромино по часовой стрелке */
function rotate(matrix) {
  const N = matrix.length;
  const result = [];
  for (let i = 0; i < N; i++) {
    result[i] = [];
    for (let j = 0; j < N; j++) {
      // поворачиваем элемент из нижнего левого положения в верхнее правое
      result[i][j] = matrix[N - j - 1][i];
    }
  }
  return result;
}

/* Перемещение текущей тетромино на заданное смещение; возвращает true, если движение допустимо */
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

/* Падение текущей тетромино на одну клетку вниз */
/* Если тетромино не может двигаться дальше вниз, то объединяем ее с полем */
function drop() {
  if (!move(0, 1)) {
    mergeTetromino();
    clearLines();
    spawnTetromino();
  }
  dropCounter = 0; // сбрасываем счетчик падения после падения
}

/* Основной игровой цикл с использованием requestAnimationFrame */
/* Обновляет состояние игры и перерисовывает поле на каждом кадре */
function update(time = 0) {
  const deltaTime = time - lastTime; // рассчитываем время, прошедшее с последнего кадра
  lastTime = time;
  dropCounter += deltaTime;
  // падение тетромино, если накопленное время превышает интервал
  if (dropCounter > dropInterval) {
    drop();
  }
  drawBoard(); // отрисовка поля; функция определена в render.js
  if (!gameOver) {
    animationFrameId = requestAnimationFrame(update);
  }
}

/* Ожидание изменения переменной */
function waitForVar() {
  const interval = setInterval(() => {
    if (Number(document.getElementById("totalScore").innerHTML) === 200) {
      updateSpeed();
    }
  }, 100);
}

waitForVar();

/* Обновление скорости падения */
function updateSpeed() {
  dropInterval = 200;
}

/* Начало игры при нажатии на кнопку Start */
document.getElementById("startButton").addEventListener("click", () => {
  resetScore();
  gameOver = false;
  createBoard();
  spawnTetromino();
  lastTime = 0;
  dropCounter = 0;
  update(); // начинаем игровой цикл
});
