import { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import styled from "styled-components";
// Pages
import TradeJournal from "./pages/TradeJournal";
import Sizing from "./pages/Sizing";
// Auth and Account Select
import AuthButton from "./auth/AuthButton";
import AccountSelection from "./components/AccountSelection";
// Utility for fetching exchange rates
import { fetchExchangeRates } from "./utils/fetchExchangeRates";
// Global Style
import { colorScheme } from "./assets/themes";
// Context
import { useAuth } from "./auth/AuthContext";
// Import Font
import DMSerifDisplayItalicTTF from './assets/DM_Serif_Display/DMSerifDisplay-Italic.ttf';
import DMSerifDisplayItalicWOFF from './assets/DM_Serif_Display/DMSerifDisplay-Italic.woff'
import DMSerifDisplayItalicWOFF2 from './assets/DM_Serif_Display/DMSerifDisplay-Italic.woff2'

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
    src: url(${DMSerifDisplayItalicWOFF2}) format("woff2"),
         url(${DMSerifDisplayItalicWOFF}) format("woff"),
         url(${DMSerifDisplayItalicTTF}) format("truetype"),
    font-style: italic;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Use the imported font */
  font-family: "DM Serif Display", serif;
  font-weight: 400;
  font-style: italic;
  margin: 0;
  line-height: 1;
`;

const Nav = styled.nav`
  margin-left: 20px;
`;

const StyledLink = styled(Link)`
  margin-right: 20px; // Creates space between nav items
  color: ${colorScheme.base["50"]}; // Use a variable for color consistency
  text-decoration: none; // Removes underline
  font-size: 1em; // Match font size with the title
  font-weight: bold; // Make it bold to stand out

  &:hover {
    text-decoration: underline; // Adds underline on hover for interactivity
    cursor: pointer; // Changes cursor to pointer on hover
  }
`;

const NavItem = styled.div`
  display: inline-block; // Allows items to be inline
  vertical-align: middle; // Vertically aligns items with the title
  line-height: normal; // Adjusts line height for proper spacing
`;

function App() {
  // Get auth token
  const { auth } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  // Conversion Rates State
  const [conversionRates, setConversionRates] = useState<
    Record<string, number>
  >({});

  // UseEffect for getting conversion rates from external API
  useEffect(() => {
    const getRates = async () => {
      try {
        const rates = await fetchExchangeRates();
        setConversionRates(rates);
      } catch (error: any) {
        console.log(error.message);
      }
    };
    getRates();
  }, []);

  useEffect(() => {
    // Fetch the default account for the user when they log in
    if (auth.isAuthenticated) {
      // Fetch and set the default account
      setSelectedAccount(auth.selectedAccount);
    }
  }, [auth]);

  return (
    <AppContainer>
      <AppHeader>
        <Header>
          <TitleContainer>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Title style={{ fontSize: "3em" }}>efolio.</Title>
            </Link>
            {auth.isAuthenticated && (
              <Nav>
                <NavItem>
                  <StyledLink to="/sizing">Sizing</StyledLink>
                </NavItem>
                {/* Add more NavItems as needed */}
              </Nav>
            )}
          </TitleContainer>
          {auth.isAuthenticated ? (
            <>
              <AccountSelection onSelectAccount={setSelectedAccount} />
            </>
          ) : (
            <AuthButton />
          )}
        </Header>
      </AppHeader>
      <Routes>
        <Route
          path="/"
          element={
            <TradeJournal
              selectedAccount={selectedAccount}
              conversionRates={conversionRates}
            />
          }
        />
        {auth.isAuthenticated && (
          <Route
            path="/sizing"
            element={<Sizing conversionRates={conversionRates} />}
          />
        )}
      </Routes>
    </AppContainer>
  );
}

export default App;
