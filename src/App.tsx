import React from "react";
import styled from "styled-components";
import TradeJournal from "./pages/TradeJournal";
import AuthButton from "./auth/AuthButton";

// Styles
const AppContainer = styled.div`
  text-align: center;
`;

const AppHeader = styled.header`
  background-color: #282c34;
  min-height: 8vh;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: center;
  font-size: calc(10px + 0.5vmin);
  color: white;
`;

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

// Component
function App() {
  return (
    <AppContainer>
      <AppHeader>
        <Header>
          <TitleContainer>
            <Title>A Trade Journal</Title>
            <Subtitle>By Evan Roubekas</Subtitle>
          </TitleContainer>
          <AuthButton />
        </Header>
      </AppHeader>
      <TradeJournal />
    </AppContainer>
  );
}

export default App;
