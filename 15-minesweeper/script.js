import {
  TILE_STATUS,
  createBoard,
  markTile,
  revealTile,
  checkWin,
  checkLose,
  revealBoard
} from './minesweeper.js';

const BOARD_SIZE = 10;
const NUMBER_OF_MINES = 10;

const board = createBoard(BOARD_SIZE, NUMBER_OF_MINES);

const boardElement = document.querySelector('.board');
const minesLeftText = document.querySelector('[data-mine-count]');
const message = document.querySelector('.subtext');

board.forEach(row => {
  row.forEach(tile => {
    boardElement.append(tile.element);
    tile.element.addEventListener('click', e => {
      revealTile(board, tile);
      checkGameEnd(board);
    });
    tile.element.addEventListener('contextmenu', e => {
      e.preventDefault();
      markTile(tile);
      listMinesLeft();
    });
  });
});

boardElement.style.setProperty('--size', BOARD_SIZE);
minesLeftText.textContent = NUMBER_OF_MINES;
console.log(board);

function listMinesLeft() {
  const markedTilesCount = board.reduce((count, row) => {
    return count + row.filter(tile => tile.status === TILE_STATUS.MARKED).length;
  }, 0);

  minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount;
}

export function checkGameEnd(board) {
  const win = checkWin(board);
  const lose = checkLose(board);

  if (win || lose) {
    boardElement.addEventListener('click', stopProp, { capture: true });
    boardElement.addEventListener('contextmenu', stopProp, { capture: true });
  }

  if (win) {
    message.textContent = 'You Win';
  }

  if (lose) {
    message.textContent = 'You Lose';
    revealBoard(board);
  }
}

function stopProp(e) {
  e.stopImmediatePropagation();
}
