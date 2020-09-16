import Head from "next/head";
import styles from "../styles/Home.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faHandPointUp } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import ChatWidget from "@papercups-io/chat-widget";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
	return (
		<>
			<Navbar bg="light" expand="lg">
				<Link href="/" style={{ cursor: "pointer" }}>
					<img
						style={{ cursor: "pointer" }}
						src="static/logo.svg"
						alt="triangle with all three sides equal"
						height="55"
						width="130"
					/>
				</Link>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse
					className="justify-content-end"
					id="basic-navbar-nav"
				>
					<Nav style={{ display: "flex", alignItems: "center" }}>
						<div className={styles.navbarLink}>
							<Link href="pricing" className={styles.linkLink}>
								Pricing
							</Link>
						</div>
						<a className={styles.navbarLink}>Community</a>
						<div className={styles.signInWrapper}>
							<button className={styles.signInButton}>
								<FontAwesomeIcon
									style={{ width: 15 }}
									icon={faPlay}
								/>
								<span className={styles.accessText}>
									Sign In
								</span>
							</button>
						</div>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
			<div className={styles.wrapper}>
				<Head>
					<title>Highlight</title>
					<link rel="icon" href="/favicon.ico" />
					<link rel="preload" href="/font" as="font" crossOrigin="" />
				</Head>
				<Component {...pageProps} />
			</div>
			<ChatWidget
				title="Welcome to Highlight"
				subtitle="Ask us anything in the chat window below 😊"
				primaryColor="#5629c6"
				greeting="Hello! Any questions?"
				newMessagePlaceholder="Start typing..."
				accountId="e843b8c5-eb8e-48fd-bc35-dd014f61ea4c"
				baseUrl="https://app.papercups.io"
			/>
		</>
	);
}

export default MyApp;
