import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Close from '../../../static/Close';
import styles from './LimitedSessionsCard.module.scss';

const LimitedSessionCard = () => {
    const [isShowing, setIsShowing] = useState(true);

    if (!isShowing) {
        return null;
    }

    return (
        <section className={styles.container}>
            <div className={styles.actionsContainer}>
                <button
                    onClick={() => {
                        setIsShowing(false);
                    }}
                    className={styles.closeButton}
                    aria-label="Close"
                >
                    <Close className={styles.closeIcon} />
                </button>
            </div>
            <h2 className={styles.header}>
                Looks like you’ve run out of sessions this month 😔
            </h2>
            <p className={styles.description}>
                Sessions recorded after you've reached your quota will not be
                viewable until you upgrade.
            </p>
            <Link to="billing" className={styles.link}>
                Upgrade plan
            </Link>
        </section>
    );
};

export default LimitedSessionCard;
