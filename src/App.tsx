import React from "react";
import styled from "styled-components";
import TradeJournal from "./pages/TradeJournal";
import AuthButton from "./auth/AuthButton";

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: flex-end;
  text-align: left;
`;

const Title = styled.h1`
  margin: 0;
  line-height: 1;
`;

const Subtitle = styled.h3`
  margin: 0 0 0 8px;
  line-height: 1;
`;

function App() {
  return (
    <div className="App">
      <Header>
        <TitleContainer>
          <Title>A Trade Journal</Title>
          <Subtitle>By Evan Roubekas</Subtitle>
        </TitleContainer>
        <AuthButton />
      </Header>
      <TradeJournal />
    </div>
  );
}

export default App;
