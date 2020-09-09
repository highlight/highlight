import React, { useEffect } from "react";
import "./App.css";

import styles from "./App.module.css";
import { client } from "./graph.js";
import { Spinner } from "./spinner.js";
import Player from "./Player";
import OrgPage from "./OrgPage.js";
import UserPage from "./UserPage.js";
import { SetupPage } from "./pages/Setup/SetupPage";
import { provider } from "./auth.js";
import { ReactComponent as HighlightLogo } from "./static/highlight-logo.svg";
import { FaUserCircle } from "react-icons/fa";

import { useAuthState } from "react-firebase-hooks/auth";
import { useQuery, gql } from "@apollo/client";
import {
	Switch,
	Route,
	BrowserRouter as Router,
	RouteComponentProps,
	Redirect
} from "react-router-dom";
import * as firebase from "firebase/app";
import { Menu, Dropdown } from "antd";

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
	const { loading: o_loading, error: o_error, data: o_data } = useQuery(gql`
		query GetOrganizations {
			organizations {
				id
			}
		}
	`);
	if (error || loading || o_error || o_loading) return <Spinner />;
	if (!o_data?.organizations?.length) return <Spinner />;

	const current_org = o_data?.organizations[0].id;
	return (
		<div className={styles.appBody}>
			<Router>
				<Header />
				<Switch>
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
					<Route path="/:organization_id/setup">
						<SetupPage />
					</Route>
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
					<Route path="/">
						<Redirect to={`/${current_org}/setup`} />
					</Route>
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
	const menu = (
		<Menu>
			<Menu.Item
				onClick={async () => {
					try {
						firebase.auth().signOut();
					} catch (e) {
						console.log(e);
					}
					client.cache.reset();
				}}
			>
				Logout
			</Menu.Item>
		</Menu>
	);

	return (
		<div className={styles.header}>
			<div className={styles.logoWrapper}>
				<HighlightLogo className={styles.logo} />
			</div>
			<div className={styles.accountIconWrapper}>
				<Dropdown overlay={menu}>
					<FaUserCircle className={styles.accountIcon} />
				</Dropdown>
			</div>
		</div>
	);
};

export default App;
