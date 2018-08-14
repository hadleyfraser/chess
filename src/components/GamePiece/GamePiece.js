import React from "react";
import styled from "styled-components";
import * as PropTypes from "prop-types";
import { CELL_WIDTH } from "../../utils/constants";

const GamePieceBase = ({ className, code }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: code }} />
);

GamePieceBase.propTypes = {
  code: PropTypes.string.isRequired,
  selected: PropTypes.bool
};

GamePieceBase.defaultProps = {
  selected: false
};

const GamePiece = styled(GamePieceBase)`
  font-size: 40px;
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

export default GamePiece;
