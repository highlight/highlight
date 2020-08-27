import React, { useState, useEffect } from "react";
import { useFetch } from "use-http";
import {
  Switch,
  Route,
  useParams,
  BrowserRouter as Router
} from "react-router-dom";
import { Replayer, mirror } from "rrweb";
import { FaUndoAlt, FaHandPointUp, FaPlay, FaPause } from "react-icons/fa";
import styles from "./App.module.css";
import { Element, scroller } from "react-scroll";
import BeatLoader from "react-spinners/BeatLoader";
import { ReactComponent as JourneyLogo } from "./logo.svg";
import { ReactComponent as WindowOptions } from "./window-options.svg";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import Player from "./Player.js";
import { client } from "./graph.js";
import Slider from "rc-slider";

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
      <Router>
        <ApolloProvider client={client}>
          <Switch>
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
        </ApolloProvider>
      </Router>
    </div>
  );
};

export default App;
