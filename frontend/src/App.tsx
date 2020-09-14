import React, { useEffect } from "react";
import "./App.css";

import styles from "./App.module.css";
import { client } from "./graph.js";
import { Spinner } from "./components/Spinner/Spinner";
import { Player } from "./pages/Player/PlayerPage";
import { SetupPage } from "./pages/Setup/SetupPage";
import { SessionsPage } from "./pages/Sessions/SessionsPage";
import { provider } from "./auth.js";
import { ReactComponent as HighlightLogo } from "./static/highlight-logo.svg";
import { FaUserCircle } from "react-icons/fa";

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
import { Menu, Dropdown } from "antd";

const App = () => {
	const { loading, error } = useQuery(gql`
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
	if (
		error ||
		loading ||
		o_error ||
		o_loading ||
		!o_data?.organizations?.length
	) {
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
	return <App />;
};

const Header = () => {
	const { organization_id } = useParams();
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
			<div className={styles.rightHeader}>
				<Link
					to={`/${organization_id}/sessions`}
					className={styles.headerLink}
				>
					Sessions
				</Link>
				<Link
					to={`/${organization_id}/setup`}
					className={styles.headerLink}
				>
					Setup
				</Link>
				<div className={styles.accountIconWrapper}>
					<Dropdown overlay={menu}>
						<FaUserCircle className={styles.accountIcon} />
					</Dropdown>
				</div>
			</div>
		</div>
	);
};

export default App;
