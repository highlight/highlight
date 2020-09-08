import React, { useEffect } from "react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import styles from "./App.module.css";
import Player from "./Player.js";
import OrgPage from "./OrgPage.js";
import UserPage from "./UserPage.js";
import { ReactComponent as HighlightLogo } from "./static/highlight-logo.svg";
import { useAuthState } from "react-firebase-hooks/auth";
import { useQuery, gql } from "@apollo/client";

import * as firebase from "firebase/app";
import { provider } from "./auth.js";
import { client } from "./graph.js";
import { Spinner } from "./spinner.js";

const Header = props => {
  return (
    <div className={styles.header}>
      <div className={styles.logoWrapper}>
        <HighlightLogo className={styles.logo} />
        <button
          onClick={async () => {
            try {
              firebase.auth().signOut();
            } catch (e) {
              console.log(e);
            }
            client.cache.reset();
          }}
        >
          logout
        </button>
      </div>
    </div>
  );
};

export const AuthAppRouter = props => {
  const [user, loading, error] = useAuthState(firebase.auth());
  useEffect(() => {
    if (!loading && !error && !user) {
      firebase.auth().signInWithRedirect(provider);
    }
  }, [user, loading, error]);
  if (loading) return <Spinner />;
  if (error) return <p>{error.toString()}</p>;
  return <App />;
};

const App = props => {
  const { loading, error, data } = useQuery(gql`
    query GetAdmin {
      admin {
        id
      }
    }
  `);
  return (
    <div className={styles.appBody}>
      <Router>
        <Header />
        <Switch>
          <Route>
            <p>logged in</p>
            <p>{JSON.stringify(data)}</p>
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
    </div>
  );
};
