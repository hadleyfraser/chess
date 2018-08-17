import React from "react";
import styled from "styled-components";
import * as PropTypes from "prop-types";
import { CELL_WIDTH } from "../../utils/constants";

const codes = require("../../utils/piece-list.json");

const GamePieceBase = ({ className, piece: { color, name } }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: codes[`${color}-${name}`] }} />
);

const GamePiece = styled(GamePieceBase)`
  font-size: ${({ size }) => size}px;
  cursor: pointer;
  text-align: center;
  ${({ selected }) => selected && `animation: bounce 1s infinite;`};

  @keyframes bounce {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-${CELL_WIDTH / 6}px);
    }

    100% {
      transform: translateY(0);
    }
  }
`;

GamePiece.propTypes = {
  piece: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  size: PropTypes.number
};

GamePiece.defaultProps = {
  selected: false,
  size: 40
};

export default GamePiece;
