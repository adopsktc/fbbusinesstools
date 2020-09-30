import React, { createContext, useState, useEffect } from "react";
import { HashRouter as Router } from "react-router-dom";
import Homepage from "./home.js";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import Amplify from "aws-amplify";
import {
  AmplifyAuthenticator,
  AmplifySignOut,
  AmplifySignIn,
} from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import awsconfig from "./aws-exports.js";

Amplify.configure(awsconfig);

const AmplifyTheme = {
  button: { backgroundColor: "red", borderColor: "red" },
};

export const GlobalContext = createContext();

const Provider = ({ children }) => {
  const [errorState, setErrorState] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const store = {
    error: [errorState, setErrorState],
    token: [accessToken, setAccessToken],
  };
  return (
    <GlobalContext.Provider value={store}>{children}</GlobalContext.Provider>
  );
};

const App = () => {
  const [authState, setAuthState] = useState();
  const [user, setUser] = useState();

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  }, []);

  return authState === AuthState.SignedIn && user ? (
    <>
      <Provider>
        <div className="App">
          <Router>
            <Homepage />
          </Router>
        </div>
      </Provider>
      <AmplifySignOut />
    </>
  ) : (
    <AmplifyAuthenticator usernameAlias="email">
      <AmplifySignIn
        theme={AmplifyTheme}
        slot="sign-in"
        hideSignUp
        usernameAlias="email"
      />
    </AmplifyAuthenticator>
  );
};

export default App;
