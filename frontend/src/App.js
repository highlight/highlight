import React, { useState, useEffect } from "react";
import Cotter from "cotter";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import styles from "./App.module.css";
import { ApolloProvider } from "@apollo/client";
import Player from "./Player.js";
import OrgPage from "./OrgPage.js";
import UserPage from "./UserPage.js";
import { client } from "./graph.js";
import {ReactComponent as HighlightLogo} from './static/highlight-logo.svg';


const Header = props => {
  return (
    <div className={styles.header}>
      <div className={styles.logoWrapper}>
        <HighlightLogo className={styles.logo} />
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
            <Route path="/">
              <Login />
            </Route>
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
          </Switch>
        </Router>
      </ApolloProvider>
    </div>
  );
};

const Login = props => {
  const [payload, setpayload] = useState(null);

  useEffect(() => {
    var cotter = new Cotter("52f49943-fe7a-4b05-861e-7ffa6ad3071f"); // 👈 Specify your API KEY ID here
    cotter
      .signInWithLink()
      .showEmailForm()
      .then(response => {
        setpayload(response); // show the response in our state
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className={styles.signinWrapper}>
      <div id="cotter-form-container" style={{ width: 300, height: 300 }} />
    </div>
  );
};

export default App;
