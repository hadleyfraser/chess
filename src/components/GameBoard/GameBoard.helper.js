import { deepClone } from "../../utils/utils";

const getPiece = (piecePosition, board) => {
  const piece = board[piecePosition.y][piecePosition.x];
  return piece && piece.name ? piece : null;
};

const setPiece = (piecePosition, piece, board) => {
  return (board[piecePosition.y][piecePosition.x] = piece
    ? {
        ...piece,
        hasMoved: true,
        validMove: false
      }
    : { hasMoved: false, validMove: false });
};

const removePiece = (board, position) => {
  const newBoard = deepClone(board);
  setPiece(position, null, newBoard);
  return newBoard;
};

const getMovedPieceBoard = (
  currentBoard,
  selectedPos,
  selectedPiece,
  clickedPos,
  clickedPiece,
  killPiece
) => {
  const newBoard = deepClone(currentBoard);
  setPiece(clickedPos, selectedPiece, newBoard);
  setPiece(selectedPos, killPiece ? null : clickedPiece, newBoard);

  return newBoard;
};

const getNewMoveList = (moveList, selectedPos, selectedPiece, clickedPos, clickedPiece) => {
  const newMoveList = deepClone(moveList);
  newMoveList.push({
    piece: selectedPiece,
    from: selectedPos,
    to: clickedPos
  });

  if (clickedPiece) {
    newMoveList.push({
      piece: clickedPiece,
      from: clickedPos,
      to: selectedPos
    });
  }

  return newMoveList;
};

const getNewMovedState = (
  board,
  killedPieces,
  moveList,
  selectedPos,
  selectedPiece,
  clickedPos,
  clickedPiece,
  killPiece = true
) => {
  const newKillPieces = deepClone(killedPieces);
  const newBoard = getMovedPieceBoard(
    board,
    selectedPos,
    selectedPiece,
    clickedPos,
    clickedPiece,
    killPiece
  );

  const newMoveList = getNewMoveList(
    moveList,
    selectedPos,
    selectedPiece,
    clickedPos,
    clickedPiece
  );

  if (killPiece && clickedPiece) {
    newKillPieces.push(clickedPiece);
  }

  return {
    board: newBoard,
    selectedPos: null,
    moveList: newMoveList,
    killedPieces: newKillPieces
  };
};

const setHighlightedMoves = (board, selectedPos) => {
  const newBoard = deepClone(board);
  return newBoard.map((row, rowIndex) =>
    row.map((cell, cellIndex) => {
      if (selectedPos) {
        const selectedPiece = getPiece(selectedPos, newBoard);
        const checkMovePos = { x: cellIndex, y: rowIndex };
        cell.validMove = selectedPos && verifyMove(board, selectedPiece, selectedPos, checkMovePos);
      } else {
        cell.validMove = false;
      }
      return cell;
    })
  );
};

const comparePosition = (pos1, pos2) => pos1 && pos2 && pos1.x === pos2.x && pos1.y === pos2.y;

const verifyMove = (board, piece, currentPos, destination) => {
  if (!piece) {
    return false;
  }
  return (
    verifyMovement[piece.name] && verifyMovement[piece.name](board, piece, currentPos, destination)
  );
};

const verifyMovement = {
  rook: (board, piece, currentPos, destination) => {
    if (
      (currentPos.x === destination.x && currentPos.y !== destination.y) ||
      (currentPos.y === destination.y && currentPos.x !== destination.x)
    ) {
      if (currentPos.y === destination.y) {
        return verifyHorizontalMovement(board, piece, currentPos, destination);
      } else {
        return verifyVerticalMovement(board, piece, currentPos, destination);
      }
    }
    return false;
  },
  knight: (board, piece, currentPos, destination) => {
    const xDiff = Math.abs(currentPos.x - destination.x);
    const yDiff = Math.abs(currentPos.y - destination.y);

    if ((xDiff === 2 && yDiff === 1) || (xDiff === 1 && yDiff === 2)) {
      const collision = getPiece(destination, board);
      if (collision && piece.color === collision.color) {
        return false;
      }
      return true;
    }
    return false;
  },
  bishop: (board, piece, currentPos, destination) => {
    const xDiff = destination.x - currentPos.x;
    const yDiff = destination.y - currentPos.y;

    if (Math.abs(xDiff) !== Math.abs(yDiff)) {
      return false;
    }

    return verifyDiagonalMovement(board, piece, currentPos, destination, xDiff, yDiff);
  },
  queen: (board, piece, currentPos, destination) => {
    const xDiff = destination.x - currentPos.x;
    const yDiff = destination.y - currentPos.y;

    if (xDiff === 0) {
      return verifyVerticalMovement(board, piece, currentPos, destination);
    } else if (yDiff === 0) {
      return verifyHorizontalMovement(board, piece, currentPos, destination);
    } else if (Math.abs(xDiff) === Math.abs(yDiff)) {
      return verifyDiagonalMovement(board, piece, currentPos, destination, xDiff, yDiff);
    }
    return false;
  },
  king: (board, piece, currentPos, destination) => {
    const xDiff = destination.x - currentPos.x;
    const yDiff = destination.y - currentPos.y;

    if (Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1) {
      return false;
    }

    const collision = getPiece(destination, board);
    return collision || piece.color !== collision.color;
  },
  pawn: (board, piece, currentPos, destination) => {
    const xDiff = destination.x - currentPos.x;
    const yDiff = destination.y - currentPos.y;

    const absXDiff = Math.abs(xDiff);
    const absYDiff = Math.abs(yDiff);

    const collision = getPiece(destination, board);

    if (
      yDiff === 0 ||
      (piece.color === "black" && yDiff > 0) ||
      (piece.color === "white" && yDiff < 0)
    ) {
      return false;
    }

    if (absXDiff === 0) {
      if (
        ((absYDiff === 1 || absYDiff === 2) && collision) ||
        (absYDiff === 2 && piece.hasMoved) ||
        absYDiff > 2
      ) {
        return false;
      }
      return true;
    } else if (absXDiff === 1 && absYDiff === 1) {
      if (collision && piece.color !== collision.color) {
        return true;
      }
    }

    return false;
  }
};

const verifyKingCastle = (board, piece, currentPos, destination) => {
  const collision = getPiece(destination, board);

  if (
    !collision ||
    !["rook", "king"].includes(collision.name) ||
    collision.hasMoved ||
    piece.hasMoved
  ) {
    return false;
  }

  // swap the rook color so we can verify the move
  const verificationBoard = deepClone(board);
  const verificationColor = collision.color === "white" ? "black" : "white";
  verificationBoard[destination.y][destination.x].color = verificationColor;

  return verifyHorizontalMovement(verificationBoard, piece, currentPos, destination);
};

const verifyPawnEnPassant = (piece, currentPos, destination, previousMove) => {
  const xDiff = destination.x - currentPos.x;
  const yDiff = destination.y - currentPos.y;
  const { piece: otherPiece, from, to } = previousMove;

  if (
    piece.name !== "pawn" ||
    otherPiece.name !== "pawn" ||
    to.x !== destination.x ||
    Math.abs(xDiff) !== 1 ||
    Math.abs(yDiff) !== 1 ||
    Math.abs(to.y - from.y) !== 2
  ) {
    return false;
  }

  return true;
};

const verifyHorizontalMovement = (board, piece, currentPos, destination) => {
  if (!piece) {
    return false;
  }
  let newX = currentPos.x;
  let reactedDestination = false;
  while (!reactedDestination) {
    newX += currentPos.x < destination.x ? 1 : -1;

    if (newX < 0) {
      return false;
    }

    const collision = getPiece({ y: currentPos.y, x: newX }, board);
    if (collision) {
      if (newX === destination.x && piece.color !== collision.color) {
        return true;
      }

      return false;
    }

    reactedDestination = newX === destination.x;
  }

  return true;
};

const verifyVerticalMovement = (board, piece, currentPos, destination) => {
  if (!piece) {
    return false;
  }
  let newY = currentPos.y;
  let reactedDestination = false;
  while (!reactedDestination) {
    newY += currentPos.y < destination.y ? 1 : -1;

    if (newY < 0) {
      return false;
    }

    const collision = getPiece({ y: newY, x: currentPos.x }, board);
    if (collision) {
      if (newY === destination.y && piece.color !== collision.color) {
        return true;
      }

      return false;
    }

    reactedDestination = newY === destination.y;
  }
  return true;
};

const verifyDiagonalMovement = (board, piece, currentPos, destination, xDiff, yDiff) => {
  if (!piece) {
    return false;
  }
  const xMove = xDiff < 0 ? -1 : 1;
  const yMove = yDiff < 0 ? -1 : 1;

  let newX = currentPos.x;
  let newY = currentPos.y;

  let reactedDestination = false;
  while (!reactedDestination) {
    newX += xMove;
    newY += yMove;

    const newPos = {
      x: newX,
      y: newY
    };

    const collision = getPiece({ x: newX, y: newY }, board);
    if (collision) {
      if (comparePosition(newPos, destination) && piece.color !== collision.color) {
        return true;
      }

      return false;
    }

    reactedDestination = comparePosition(newPos, destination);
  }

  return true;
};

export {
  comparePosition,
  getNewMovedState,
  getPiece,
  removePiece,
  setHighlightedMoves,
  setPiece,
  verifyKingCastle,
  verifyMove,
  verifyPawnEnPassant
};
