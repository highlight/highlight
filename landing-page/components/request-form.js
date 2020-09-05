import styles from "../styles/Home.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faHandPointUp } from "@fortawesome/free-solid-svg-icons";

const RequestForm = props => {
  return (
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
  );
};

export default RequestForm;
