import React from "react";
import styled from "styled-components";
import getDeepProp from "lodash.get";
import { CELL_LIMIT, CELL_WIDTH } from "../../utils/constants";
import {
  comparePosition,
  getNewMovedState,
  getPiece,
  setHighlightedMoves,
  verifyKingCastle,
  verifyMove,
  verifyPawnEnPassant
} from "./GameBoard.helper";
import Cell from "../Cells/Cell";
import GamePiece from "../GamePiece/GamePiece";

const startPosition = require("../../utils/start-position.json");

const switchColor = (color) => (color === "#fff" ? "#ccc" : "#fff");

const emptyCell = {
  hasMoved: false,
  validMove: false
};

const Row = styled.div`
  display: flex;

  > div {
    &:nth-child(odd) {
      background: ${(props) => props.color};
    }
    &:nth-child(even) {
      background: ${(props) => switchColor(props.color)};
    }
  }
`;

class GameBoardBase extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      board: this._getInitialBoard(),
      selectedPos: null,
      moveList: []
    };
  }

  _getInitialBoard = () => {
    const board = [];
    for (let row = 0; row < CELL_LIMIT; row++) {
      const boardRow = [];
      for (let col = 0; col < CELL_LIMIT; col++) {
        const piece = getDeepProp(startPosition, `${row}.${col}`) || {};
        boardRow.push(piece && { ...piece, ...emptyCell });
      }

      board.push(boardRow);
    }

    return board;
  };

  _clickCell = (clickedPos) => {
    this.setState((prevState) => {
      const { board, moveList, selectedPos } = prevState;
      const clickedPiece = getPiece(clickedPos, board);

      if (selectedPos) {
        if (comparePosition(selectedPos, clickedPos)) {
          return {
            board: board,
            selectedPos: null
          };
        } else {
          const selectedPiece = getPiece(selectedPos, board);

          if (verifyKingCastle(board, selectedPiece, selectedPos, clickedPos)) {
            return getNewMovedState(
              board,
              moveList,
              selectedPos,
              selectedPiece,
              clickedPos,
              clickedPiece
            );
          }

          // const previousMove = moveList.length && moveList[moveList.length - 1];
          // if (
          //   previousMove &&
          //   verifyPawnEnPassant(selectedPiece, selectedPos, clickedPos, previousMove)
          // ) {
          //   // getMovedPieceBoard(board, selectedPos, selectedPiece, clickedPos);
          // }

          if (!verifyMove(board, selectedPiece, selectedPos, clickedPos)) {
            console.log(`${JSON.stringify(clickedPos)} is not a valid move`);
            return {};
          }
          return getNewMovedState(board, moveList, selectedPos, selectedPiece, clickedPos);
        }
      } else {
        const selectedPos = clickedPiece ? clickedPos : null;
        return { selectedPos };
      }
    });
  };

  render() {
    const { className } = this.props;
    const { board, selectedPos } = this.state;

    let rowColor = "#fff";
    return (
      <div className={className}>
        {board.map((boardRow, rowIndex) => {
          const row = (
            <Row color={rowColor} key={rowIndex}>
              {boardRow.map((cell, colIndex) => (
                <Cell
                  key={`${rowIndex}${colIndex}`}
                  onClick={() => this._clickCell({ x: colIndex, y: rowIndex })}
                  validMove={cell.validMove}
                >
                  {cell.name && (
                    <GamePiece
                      code={cell.code}
                      selected={
                        selectedPos &&
                        comparePosition(selectedPos, {
                          x: colIndex,
                          y: rowIndex
                        })
                      }
                    />
                  )}
                </Cell>
              ))}
            </Row>
          );
          rowColor = switchColor(rowColor);
          return row;
        })}
      </div>
    );
  }
}

const GameBoard = styled(GameBoardBase)`
  width: ${CELL_LIMIT * CELL_WIDTH}px;
  margin: 0 auto;
  border: solid 2px black;
`;

export default GameBoard;