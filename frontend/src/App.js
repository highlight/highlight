import React from "react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import styles from "./App.module.css";
import { ReactComponent as JourneyLogo } from "./logo.svg";
import { ApolloProvider } from "@apollo/client";
import Player from "./Player.js";
import OrgPage from "./OrgPage.js";
import UserPage from "./UserPage.js";
import { client } from "./graph.js";

const Header = props => {
  return (
    <div className={styles.header}>
      <div className={styles.logoWrapper}>
        <JourneyLogo className={styles.logo} />
      </div>
    </div>
  );
};

const App = props => {
  return (
    <div className={styles.appBody}>
      <Header />
      <ApolloProvider client={client}>
        <Router>
          <Switch>
            <Route
              path="/:organization_id/:user_id/:session_id"
              component={props => (
                <>
                  <div className={styles.playerPageBody}>
                    <Player {...props} />
                  </div>
                </>
              )}
            />
            <Route
              path="/:organization_id/:user_id"
              component={props => <UserPage {...props} />}
            />
            <Route
              path="/:organization_id"
              component={props => <OrgPage {...props} />}
            />
            <Route path="/:vid">
              <Header />
              <div className={styles.playerPageBody}>
                <Player />
              </div>
            </Route>
            <Route path="/">
              <p>yo, waddup</p>
            </Route>
          </Switch>
        </Router>
      </ApolloProvider>
    </div>
  );
};

export default App;
