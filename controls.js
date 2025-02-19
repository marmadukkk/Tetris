// controls.js — Обработка нажатий клавиш

// Слушаем события нажатия клавиш на документе
document.addEventListener("keydown", (event) => {
  // Если игра завершена или текущий тетромино отсутствует, игнорируем нажатия
  if (gameOver || !currentTetromino) return;

  // Обработка нажатий в зависимости от кода клавиши
  switch (event.code) {
    case "ArrowLeft": // Стрелка влево
      move(-1, 0); // Двигаем тетромино влево
      break;
    case "ArrowRight": // Стрелка вправо
      move(1, 0); // Двигаем тетромино вправо
      break;
    case "ArrowDown": // Стрелка вниз
      drop(); // Ускоряем падение тетромино
      break;
    case "ArrowUp": // Стрелка вверх
      // Поворачиваем тетромино
      const rotated = rotate(currentTetromino.shape);
      // Проверяем, можно ли повернуть тетромино в текущей позиции
      if (isValidPosition(rotated, currentX, currentY)) {
        currentTetromino.shape = rotated; // Применяем поворот
      }
      break;
  }
});
