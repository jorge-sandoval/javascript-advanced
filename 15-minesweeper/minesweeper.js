import { times, range } from 'lodash/fp';

export const TILE_STATUS = {
  HIDDEN: 'hidden',
  MINE: 'mine',
  NUMBER: 'number',
  MARKED: 'marked',
};

export function createBoard(boardSize, minePositions) {
  return times(x => {
    return times(y => {
      return {
        x,
        y,
        mine: minePositions.some(m => positionMatch(m, { x, y })),
        status: TILE_STATUS.HIDDEN,
      };
    }, boardSize);
  }, boardSize);
}

export function checkWin(board) {
  return board.every(row => {
    return row.every(tile => {
      return (
        tile.status === TILE_STATUS.NUMBER ||
        (tile.mine &&
          (tile.status === TILE_STATUS.MARKED ||
            tile.status === TILE_STATUS.HIDDEN))
      );
    });
  });
}

export function checkLose(board) {
  return board.some(row => {
    return row.some(tile => {
      return tile.status === TILE_STATUS.MINE;
    });
  });
}

export function revealTile(board, { x, y }) {
  const tile = board[x][y];
  if (tile.status !== TILE_STATUS.HIDDEN) {
    return board;
  }

  if (tile.mine) {
    return replaceTile(
      board,
      { x, y },
      { ...tile, status: TILE_STATUS.MINE }
    );
  }

  const adjacentTiles = nearbyTiles(board, tile);
  const mines = adjacentTiles.filter(t => t.mine);
  let newBoard = replaceTile(
    board,
    { x, y },
    { ...tile, status: TILE_STATUS.NUMBER, adjacentMinesCount: mines.length }
  );

  if (mines.length === 0) {
    return adjacentTiles.reduce((b, t) => {
      return revealTile(b, t);
    }, newBoard);
  }

  return newBoard;
}

export function markTile(board, { x, y }) {
  const tile = board[x][y];
  if (
    tile.status !== TILE_STATUS.HIDDEN &&
    tile.status !== TILE_STATUS.MARKED
  ) {
    return board;
  }

  if (tile.status === TILE_STATUS.MARKED) {
    return replaceTile(
      board,
      { x, y },
      { ...tile, status: TILE_STATUS.HIDDEN }
    );
  } else {
    return replaceTile(
      board,
      { x, y },
      { ...tile, status: TILE_STATUS.MARKED }
    );
  }
}

export function positionMatch(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function countTilesByStatus(board, tileStatus) {
  return board.reduce((count, row) => {
    return count + row.filter(tile => tile.status === tileStatus).length;
  }, 0);
}

function nearbyTiles(board, { x, y }) {
  const offsets = range(-1, 2);

  return offsets.flatMap(xOffset => {
    return offsets.map(yOffset => {
      return board[x + xOffset]?.[y + yOffset];
    });
  }).filter(tile => !!tile);
}

function replaceTile(board, { x, y }, newTile) {
  return board.map((row, rowIndex) => {
    return row.map((tile, tileIndex) => {
      if (x === rowIndex && y === tileIndex) {
        return newTile;
      }
      return tile;
    });
  });
}
