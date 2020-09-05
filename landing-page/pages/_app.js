import "../styles/globals.css";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faHandPointUp } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

function MyApp({ Component, pageProps }) {
  console.log(pageProps);
  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.navbar}>
          <div className={styles.navbarContent}>
            <Link href="/" style={{ cursor: "pointer" }}>
              <img
                style={{ cursor: "pointer" }}
                src="static/logo.svg"
                alt="triangle with all three sides equal"
                height="55"
                width="130"
              />
            </Link>
            <div className={styles.navbarRight}>
              <div className={styles.navbarLink}>
                <Link href="pricing">Pricing</Link>
              </div>
              <a className={styles.navbarLink}>Community</a>
              <div className={styles.signInWrapper}>
                <button className={styles.signInButton}>
                  <FontAwesomeIcon style={{ width: 15 }} icon={faPlay} />
                  <p className={styles.accessText}>Sign In</p>
                </button>
              </div>
            </div>
          </div>
        </div>
        <Head>
          <title>Highlight</title>
          <link rel="icon" href="/favicon.ico" />
          <link rel="preload" href="/font" as="font" crossOrigin="" />
        </Head>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
