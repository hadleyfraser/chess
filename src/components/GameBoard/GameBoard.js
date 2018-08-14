import React from "react";
import styled from "styled-components";
import getDeepProp from "lodash.get";
import { CELL_LIMIT } from "../../utils/constants";
import {
  comparePosition,
  getNewMovedState,
  getPiece,
  verifyKingCastle,
  verifyMove
} from "./GameBoard.helper";
import Cell from "../Cells/Cell";
import GamePiece from "../GamePiece/GamePiece";
import KillList from "../KillList/KillList";

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
      moveList: [],
      killedPieces: []
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
      const { board, killedPieces, moveList, selectedPos } = prevState;
      const clickedPiece = getPiece(clickedPos, board);

      if (selectedPos) {
        if (comparePosition(selectedPos, clickedPos)) {
          return {
            selectedPos: null
          };
        } else {
          const selectedPiece = getPiece(selectedPos, board);

          if (verifyKingCastle(board, selectedPiece, selectedPos, clickedPos)) {
            return getNewMovedState(
              board,
              killedPieces,
              moveList,
              selectedPos,
              selectedPiece,
              clickedPos,
              clickedPiece,
              false
            );
          }

          // const previousMove = moveList.length && moveList[moveList.length - 1];
          // if (
          //   previousMove &&
          //   verifyPawnEnPassant(selectedPiece, selectedPos, clickedPos, previousMove)
          // ) {
          //   const killPiecePos = { x: clickedPos.x, y: selectedPos.y };
          //   const newBoard = removePiece(board, killPiecePos);
          //   return getNewMovedState(
          //     newBoard,
          //     moveList,
          //     selectedPos,
          //     selectedPiece,
          //     clickedPos,
          //     killPiecePos,
          //     killPiecePos
          //   );
          // }

          if (!verifyMove(board, selectedPiece, selectedPos, clickedPos)) {
            console.log(`${JSON.stringify(clickedPos)} is not a valid move`);
            return {};
          }
          return getNewMovedState(
            board,
            killedPieces,
            moveList,
            selectedPos,
            selectedPiece,
            clickedPos,
            clickedPiece
          );
        }
      } else {
        const selectedPos = clickedPiece ? clickedPos : null;
        return { selectedPos };
      }
    });
  };

  render() {
    const { className } = this.props;
    const { board, selectedPos, killedPieces } = this.state;

    let rowColor = "#fff";
    return (
      <div className={className}>
        <div className="gameboard">
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
        <KillList killList={killedPieces} />
      </div>
    );
  }
}

const GameBoard = styled(GameBoardBase)`
  width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;

  .gameboard {
    border: solid 2px black;
  }
`;

export default GameBoard;
