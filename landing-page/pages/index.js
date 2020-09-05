import Head from "next/head";
import styles from "../styles/Home.module.css";

import { faPlay, faHandPointUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Home() {
  return (
    <>
      <div className={styles.contentWrap}>
        <div className={styles.copySection}>
          <div className={styles.copyHeader}>
            Step into the shoes of your users.
          </div>
          <div className={styles.copyBody}>
            Highlight gives your team insight into how users are &nbsp;
            <span className={styles.actually}>actually</span> interacting with
            your site.
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
    </>
  );
}
