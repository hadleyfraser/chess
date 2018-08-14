import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
const pieces = require("../../utils/piece-list.json");

const PieceListBase = ({ className, pawnUpgrade, selectPiece }) => (
  <div className={className}>
    <h2>Select A Piece</h2>
    <div className="piece-list">
      {Object.keys(pieces).map((name) => {
        const [pieceColor, pieceName] = name.split("-");
        if (pawnUpgrade.piece.color === pieceColor && pieceName !== "pawn") {
          return (
            <div
              onClick={() => selectPiece(pawnUpgrade.position, pieceName)}
              key={name}
              dangerouslySetInnerHTML={{ __html: pieces[name] }}
            />
          );
        }
        return null;
      })}
    </div>
  </div>
);

const PieceList = styled(PieceListBase)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;

  h2 {
    text-align: center;
    margin-bottom: 0;
  }

  .piece-list {
    display: flex;
    font-size: 40px;

    div {
      margin: 5px;
      padding: 0 5px;
      cursor: pointer;
      transition: background-color 0.1s;

      &:hover {
        background-color: #eee;
      }
    }
  }
`;

PieceList.propTypes = {
  className: PropTypes.string,
  pawnUpgrade: PropTypes.object.isRequired,
  selectPiece: PropTypes.func.isRequired
};

PieceList.defaultProps = {
  className: ""
};

export default PieceList;
