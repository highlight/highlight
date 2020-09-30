import React, { useEffect } from "react";
import "./App.css";

import styles from "./App.module.css";
import { client } from "./util/graph";
import { Spinner } from "./components/Spinner/Spinner";
import { Player } from "./pages/Player/PlayerPage";
import { SetupPage } from "./pages/Setup/SetupPage";
import { SessionsPage } from "./pages/Sessions/SessionsPage";
import { SessionsPageBETA } from "./pages/Sessions/SessionsPageBETA";
import { provider } from "./util/auth";
import { ReactComponent as HighlightLogo } from "./static/highlight-logo.svg";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

import { useParams } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useQuery, gql } from "@apollo/client";
import {
  Switch,
  Route,
  BrowserRouter as Router,
  Redirect,
  Link
} from "react-router-dom";
import * as firebase from "firebase/app";
import { Dropdown, Skeleton } from "antd";

const App = () => {
  const { loading: o_loading, error: o_error, data: o_data } = useQuery(gql`
    query GetOrganizations {
      organizations {
        id
      }
    }
  `);
  if (o_error || o_loading || !o_data?.organizations?.length) {
    return (
      <div className={styles.loadingWrapper}>
        <Spinner />
      </div>
    );
  }

  const current_org = o_data?.organizations[0].id;
  return (
    <div className={styles.appBody}>
      <Router>
        <Route path="/:organization_id">
          <Header />
        </Route>
        <Switch>
          <Route path="/:organization_id/sessions/:session_id">
            <div className={styles.playerPageBody}>
              <Player />
            </div>
          </Route>
          <Route path="/:organization_id/sessions-beta">
            <SessionsPageBETA />
          </Route>
          <Route path="/:organization_id/sessions">
            <SessionsPage />
          </Route>
          <Route path="/:organization_id/setup">
            <SetupPage />
          </Route>
          <Route path="/">
            <Redirect to={`/${current_org}/setup`} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export const AuthAdminRouter = () => {
  const { loading, error, data } = useQuery<{
    admin: { id: string; name: string; email: string };
  }>(gql`
    query GetAdmin {
      admin {
        id
        name
        email
      }
    }
  `);
  const admin = data?.admin;
  useEffect(() => {
    if (admin) {
      const { email, id, name } = admin;
      (window as any).H.identify(email, { id, name });
    }
  }, [admin]);
  if (error || loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spinner />
      </div>
    );
  }
  return <App />;
};

export const AuthAppRouter = () => {
  const [user, loading, error] = useAuthState(firebase.auth());
  useEffect(() => {
    if (!loading && !error && !user) {
      firebase.auth().signInWithRedirect(provider);
    }
  }, [user, loading, error]);
  if (loading || error)
    return (
      <div className={styles.loadingWrapper}>
        <Spinner />
      </div>
    );
  return <AuthAdminRouter />;
};

const Header = () => {
  const { organization_id } = useParams();
  const { loading: a_loading, error: a_error, data: a_data } = useQuery<{
    admin: { id: string; name: string; email: string };
  }>(gql`
    query GetAdmin {
      admin {
        id
        name
        email
      }
    }
  `);
  const menu = (
    <div className={styles.dropdownMenu}>
      <div className={styles.dropdownInner}>
        {a_loading || a_error ? (
          <Skeleton />
        ) : (
          <div>
            <div className={styles.dropdownName}>{a_data?.admin.name}</div>
            <div className={styles.dropdownEmail}>{a_data?.admin.email}</div>
            <div
              className={styles.dropdownLogout}
              onClick={async () => {
                try {
                  firebase.auth().signOut();
                } catch (e) {
                  console.log(e);
                }
                client.cache.reset();
              }}
            >
              <FiLogOut />
              <span className={styles.dropdownLogoutText}>Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.header}>
      <div className={styles.logoWrapper}>
        <HighlightLogo className={styles.logo} />
      </div>
      <div className={styles.rightHeader}>
        <Link to={`/${organization_id}/sessions`} className={styles.headerLink}>
          Sessions
        </Link>
        <Link to={`/${organization_id}/setup`} className={styles.headerLink}>
          Setup
        </Link>
        <Dropdown overlay={menu} placement={"bottomRight"} arrow>
          <div className={styles.accountIconWrapper}>
            <FaUserCircle className={styles.accountIcon} />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default App;
