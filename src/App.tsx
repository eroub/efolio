import styled from "styled-components";
import TradeJournal from "./pages/TradeJournal";
import AuthButton from "./auth/AuthButton";
// Global Style
import { colorScheme } from "./assets/themes";

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
  color: ${colorScheme.base["50"]};
  background-color: ${colorScheme.base["700"]} !important;
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
  @font-face {
    font-family: "DM Serif Display";
    src: url(${process.env.PUBLIC_URL +
      "/assets/DM_Serif_Display/DMSerifDisplay-Italic.ttf"})
      format("truetype");
    font-weight: bold;
    font-style: italic;
  }

  /* Use the imported font */
  font-family: "DM Serif Display", serif;
  font-style: italic;
  margin: 0;
  line-height: 1;
`;

function App() {
  return (
    <AppContainer>
      <AppHeader>
        <Header>
          <TitleContainer>
            <Title style={{ fontSize: "3em" }}>efolio.</Title>
          </TitleContainer>
          <AuthButton />
        </Header>
      </AppHeader>
      <TradeJournal />
    </AppContainer>
  );
}

export default App;
