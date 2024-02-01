import {
  TILE_STATUS,
  createBoard,
  markTile,
  revealTile,
  checkWin,
  checkLose,
  positionMatch,
  countTilesByStatus,
} from './minesweeper.js';

const BOARD_SIZE = 5;
const NUMBER_OF_MINES = 10;

let board = createBoard(
  BOARD_SIZE,
  getMinePositions(BOARD_SIZE, NUMBER_OF_MINES)
);

const boardElement = document.querySelector('.board');
const minesLeftText = document.querySelector('[data-mine-count]');
const message = document.querySelector('.subtext');

boardElement.style.setProperty('--size', BOARD_SIZE);
render();

function render() {
  boardElement.innerHTML = '';

  checkGameEnd();
  getTileElements().forEach(tile => boardElement.append(tile));
  listMinesLeft();
}

function getTileElements() {
  return board.flatMap(row => row.map(tileToElement));
}

function tileToElement(tile) {
  const element = document.createElement('div');
  element.dataset.status = tile.status;
  element.dataset.x = tile.x;
  element.dataset.y = tile.y;
  element.textContent = tile.adjacentMinesCount || ''

  return element;
}

boardElement.addEventListener('click', e => {
  if(!e.target.matches('[data-status]')) return;

  const x = parseInt(e.target.dataset.x);
  const y = parseInt(e.target.dataset.y);
  board = revealTile(
    board,
    { x, y }
  );

  render();
});

boardElement.addEventListener('contextmenu', e => {
  if(!e.target.matches('[data-status]')) return;

  e.preventDefault();
  const x = parseInt(e.target.dataset.x);
  const y = parseInt(e.target.dataset.y);
  board = markTile(
    board,
    { x, y }
  );

  render();
});

function listMinesLeft() {
  const markedTilesCount = countTilesByStatus(board, TILE_STATUS.MARKED);
  minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount;
}

function checkGameEnd() {
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
    board.forEach((row) => {
      row.forEach((tile) => {
        if (tile.status === TILE_STATUS.MARKED) board = markTile(board, tile);
        if (tile.mine) board = revealTile(board, tile);
      });
    });
  }
}

function stopProp(e) {
  e.stopImmediatePropagation();
}

function getMinePositions(boardSize, numberOfMines) {
  const positions = [];

  while (positions.length < numberOfMines) {
    const position = {
      x: randomNumber(boardSize),
      y: randomNumber(boardSize),
    };

    if(!positions.some(p => positionMatch(p, position))) {
      positions.push(position);
    }
  }

  return positions;
}

function randomNumber(size) {
  return Math.floor(Math.random() * size);
}
