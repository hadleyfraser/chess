import React, { Component } from "react";
import styled from "styled-components";
import GameBoard from "../GameBoard/GameBoard";

const H1 = styled.h1`
  text-align: center;
`;

class App extends Component {
  render() {
    return (
      <div className="App">
        <H1>Welcome to Chess</H1>
        <GameBoard />
      </div>
    );
  }
}

export default App;
