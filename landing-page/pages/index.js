import Head from "next/head";
import styles from "../styles/Home.module.css";
import RequestForm from "../components/request-form.js";

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
          <RequestForm />
          <div className={styles.sideNote}>
           Setup is just two lines of code.
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
