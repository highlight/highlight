import React, { useEffect } from "react";
import "./App.css";

import styles from "./App.module.css";
import { client } from "./graph.js";
import { Spinner } from "./spinner.js";
import Player from "./Player";
import OrgPage from "./OrgPage.js";
import UserPage from "./UserPage.js";
import { provider } from "./auth.js";
import { ReactComponent as HighlightLogo } from "./static/highlight-logo.svg";

import { useAuthState } from "react-firebase-hooks/auth";
import { useQuery, gql } from "@apollo/client";
import {
	Switch,
	Route,
	BrowserRouter as Router,
	RouteComponentProps
} from "react-router-dom";
import * as firebase from "firebase/app";

const App = () => {
	const { loading, error, data } = useQuery(gql`
		query GetAdmin {
			admin {
				id
				name
				email
			}
		}
	`);
	if (error || loading) return <Spinner />;
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
						component={() => (
							<>
								<div className={styles.playerPageBody}>
									<Player />
								</div>
							</>
						)}
					/>
					<Route
						path="/:organization_id/:user_id"
						component={(props: RouteComponentProps) => (
							<UserPage {...props} />
						)}
					/>
					<Route
						path="/:organization_id"
						component={(props: RouteComponentProps) => (
							<OrgPage {...props} />
						)}
					/>
				</Switch>
			</Router>
		</div>
	);
};

export const AuthAppRouter = () => {
	const [user, loading, error] = useAuthState(firebase.auth());
	useEffect(() => {
		if (!loading && !error && !user) {
			firebase.auth().signInWithRedirect(provider);
		}
	}, [user, loading, error]);
	if (loading || error) return <Spinner />;
	return <App />;
};

const Header = () => {
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

export default App;
