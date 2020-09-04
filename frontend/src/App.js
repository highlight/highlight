import React, { useState, useEffect } from "react";
import {
  Switch,
  Route,
  BrowserRouter as Router,
  Redirect
} from "react-router-dom";
import styles from "./App.module.css";
import { ApolloProvider } from "@apollo/client";
import Player from "./Player.js";
import OrgPage from "./OrgPage.js";
import UserPage from "./UserPage.js";
import { client } from "./graph.js";
import { ReactComponent as HighlightLogo } from "./static/highlight-logo.svg";
import { useAuthState } from "react-firebase-hooks/auth";

import BarLoader from "react-spinners/ClipLoader";
import * as firebase from "firebase/app";
import "firebase/auth";

var firebaseConfig = {
  apiKey: "AIzaSyD7g86A3EzEKmoE7aZ04Re3HZ0B4bWlL68",
  authDomain: "auth.highlight.run",
  databaseURL: "https://highlight-f5c5b.firebaseio.com",
  projectId: "highlight-f5c5b",
  storageBucket: "highlight-f5c5b.appspot.com",
  messagingSenderId: "263184175068",
  appId: "1:263184175068:web:f8190c20320087d1c6c919"
};

firebase.initializeApp(firebaseConfig);
var provider = new firebase.auth.GoogleAuthProvider();

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
            <Route>
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

const login = () => {
  firebase.auth().signInWithRedirect(provider);
};

const logout = () => {
  firebase.auth().signOut();
};

const Login = props => {
  const [user, loading, error] = useAuthState(firebase.auth());
  console.log(user);
  useEffect(() => {
    if (user) {
      console.log(user.getIdToken());
    }
  }, [user]);

  return (
    <>
      {loading ? <p>loading</p> : <p>chicken</p>}
      <button onClick={() => login()}>hi</button>
    </>
  );
};

export default App;
