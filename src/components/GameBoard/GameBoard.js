import React from "react";
import styled from "styled-components";
import getDeepProp from "lodash.get";
import { CELL_LIMIT } from "../../utils/constants";
import {
  changePlayerColor,
  comparePosition,
  getNewMovedState,
  getPiece,
  removePiece,
  setHighlightedMoves,
  verifyKingCastle,
  verifyMove,
  verifyPawnEnPassant,
  verifyPawnUpgrade
} from "./GameBoard.helper";
import Cell from "../Cells/Cell";
import GamePiece from "../GamePiece/GamePiece";
import KillList from "../KillList/KillList";
import Overlay from "../Overlay/Overlay";
import PieceList from "../PieceList/PieceList";
import { deepClone } from "../../utils/utils";

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
      checkmate: false,
      inCheck: false,
      killList: [],
      moveList: [],
      playerTurn: "white",
      pawnUpgrade: null,
      selectedPos: null
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
    if (this.state.checkmate) {
      return;
    }

    this.setState((prevState) => {
      const { board, killList, moveList, playerTurn, selectedPos } = prevState;
      const clickedPiece = getPiece(clickedPos, board);

      if (selectedPos) {
        if (comparePosition(selectedPos, clickedPos)) {
          return {
            selectedPos: null,
            board: setHighlightedMoves(board)
          };
        } else {
          const selectedPiece = getPiece(selectedPos, board);

          if (verifyKingCastle(board, selectedPiece, selectedPos, clickedPos)) {
            return {
              ...getNewMovedState(
                board,
                killList,
                moveList,
                selectedPos,
                selectedPiece,
                clickedPos,
                clickedPiece,
                false
              ),
              playerTurn: changePlayerColor(playerTurn)
            };
          }

          const previousMove = moveList.length && moveList[moveList.length - 1];
          if (
            previousMove &&
            verifyPawnEnPassant(selectedPiece, selectedPos, clickedPos, previousMove)
          ) {
            const killPiecePos = { x: clickedPos.x, y: selectedPos.y };
            const newData = removePiece(board, killList, killPiecePos);

            return {
              ...getNewMovedState(
                newData.board,
                newData.killList,
                moveList,
                selectedPos,
                selectedPiece,
                clickedPos
              ),
              playerTurn: changePlayerColor(playerTurn)
            };
          }

          if (!verifyMove(board, selectedPiece, selectedPos, clickedPos)) {
            console.log(`${JSON.stringify(clickedPos)} is not a valid move`);
            return {};
          }

          const newState = {
            ...getNewMovedState(
              board,
              killList,
              moveList,
              selectedPos,
              selectedPiece,
              clickedPos,
              clickedPiece
            ),
            playerTurn: changePlayerColor(playerTurn)
          };

          if (verifyPawnUpgrade(selectedPiece, clickedPos)) {
            newState.pawnUpgrade = {
              piece: selectedPiece,
              position: clickedPos
            };
          }

          return newState;
        }
      } else {
        const sameColor = clickedPiece && clickedPiece.color === playerTurn;
        const newState = {
          selectedPos: clickedPiece && sameColor ? clickedPos : null
        };
        if (sameColor) {
          newState.board = setHighlightedMoves(board, clickedPos);
        }
        return newState;
      }
    });
  };

  upgradePawn = (position, newPiece) => {
    this.setState(({ board }) => {
      const newBoard = deepClone(board);
      newBoard[position.y][position.x].name = newPiece;
      return {
        board: newBoard,
        pawnUpgrade: null
      };
    });
  };

  render() {
    const { className } = this.props;
    const { board, checkmate, inCheck, selectedPos, killList, pawnUpgrade } = this.state;

    let rowColor = "#fff";
    return (
      <div className={className}>
        <div className="gameboard">
          <div className="board">
            {pawnUpgrade && (
              <Overlay>
                <PieceList pawnUpgrade={pawnUpgrade} selectPiece={this.upgradePawn} />
              </Overlay>
            )}
            {board.map((boardRow, rowIndex) => {
              const row = (
                <Row color={rowColor} key={rowIndex}>
                  {boardRow.map((piece, colIndex) => (
                    <Cell
                      key={`${rowIndex}${colIndex}`}
                      onClick={() => this._clickCell({ x: colIndex, y: rowIndex })}
                      validMove={piece.validMove}
                    >
                      {piece.name && (
                        <GamePiece
                          piece={piece}
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
          {inCheck && <h3>{`Check${checkmate && "mate"}`}</h3>}
        </div>
        <KillList killList={killList} />
      </div>
    );
  }
}

const GameBoard = styled(GameBoardBase)`
  width: 700px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;

  .gameboard {
    h3 {
      text-align: center;
    }
    .board {
      position: relative;
      border: solid 2px black;
    }
  }
`;

export default GameBoard;
