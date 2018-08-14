import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import GamePiece from "../GamePiece/GamePiece";

const splitKills = (killList) => {
  const kills = {
    white: [],
    black: []
  };
  killList.forEach((piece, index) => kills[piece.color].push({ ...piece, killOrder: index }));
  return kills;
};

const KillListBase = ({ className, killList }) => {
  const splitKillList = splitKills(killList);
  return (
    <div className={className}>
      <h2>Lost Pieces</h2>
      <div className="pieces">
        {Object.keys(splitKillList).map((color, killOrder) => (
          <div key={color}>
            {splitKillList[color].map((kill) => (
              <GamePiece key={kill.killOrder} piece={kill} size={24} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const KillList = styled(KillListBase)`
  width: 150px;
  text-align: center;

  h2 {
    margin-top: 0;
  }

  .pieces {
    display: flex;
    border: solid 1px black;

    > div {
      flex: 1;
      min-height: 300px;
      padding-bottom: 5px;

      &:first-child {
        border-right: solid 1px black;
      }
    }
  }
`;

KillList.propTypes = {
  className: PropTypes.string,
  killList: PropTypes.array.isRequired
};

KillList.defaultProps = {
  className: ""
};

export default KillList;
