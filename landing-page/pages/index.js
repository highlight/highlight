import Head from "next/head";
import styles from "../styles/Home.module.css";

import { faPlay, faHandPointUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Home() {
  return (
    <>
      <Head>
        <title>Highlight</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href="/font" as="font" crossOrigin="" />
      </Head>
      <div className={styles.wrapper}>
        <div className={styles.navbar}>
          <div className={styles.navbarContent}>
            <img
              src="static/logo.svg"
              alt="triangle with all three sides equal"
              height="55"
              width="130"
            />
            <div className={styles.navbarRight}>
              <a href="./pricing" className={styles.navbarLink}>
                Pricing
              </a>
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
        <div className={styles.contentWrap}>
          <div className={styles.copySection}>
            <div className={styles.copyHeader}>
              Step into the shoes of your users.
            </div>
            <div className={styles.copyBody}>
              Highlight gives your team insight into how users are &nbsp;
              <span className={styles.actually}>actually</span> interacting with your
              site.
            </div>
            <div className={styles.formSection}>
              <form>
                <div className={styles.formWrapper}>
                  <input
                    type="text"
                    id="fname"
                    name="fname"
                    placeholder="Email Address"
                    className={styles.requestInput}
                  />
                  <br />
                  <button className={styles.requestButton}>
                    <FontAwesomeIcon style={{ width: 15 }} icon={faHandPointUp} />
                    <p className={styles.accessText}>Request Access</p>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className={styles.gifSection}>
            <img
              className={styles.gif}
              src="static/animate.gif"
              alt="description of gif"
            />
          </div>
        </div>
      </div>
    </>
  );
}
