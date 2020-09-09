import React from "react";

import styles from "./SetupPage.module.css";
import { CodeBlock } from "./CodeBlock";

export const SetupPage = () => {
  return (
    <div className={styles.setupWrapper}>
      <div className={styles.snippetCard}>
        <div className={styles.snippetHeading}>Your Recording Snippet</div>
        <div className={styles.snippetSubHeading}>
          Copy and paste the script below into the head of every page you wish
          to record.
        </div>
        <CodeBlock org_id={1} />
      </div>
    </div>
  );
};
