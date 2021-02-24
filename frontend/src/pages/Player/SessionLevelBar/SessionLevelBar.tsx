import React from 'react';
import styles from './SessionLevelBar.module.scss';
import SessionToken from './SessionToken/SessionToken';
import { ReactComponent as BrowserIcon } from '../../../static/browser.svg';
import { ReactComponent as URLIcon } from '../../../static/link.svg';
import ActivityIcon from './ActivityIcon/ActivityIcon';

interface Props {
    foo?: string;
}

const SessionLevelBar = (props: Props) => {
    return (
        <div className={styles.sessionLevelBarContainer}>
            <SessionToken icon={<BrowserIcon />}>300 x 300</SessionToken>
            <SessionToken icon={<URLIcon />}>
                https://chicken.chicken.com/chicken
                https://chicken.chicken.com/chicken
            </SessionToken>
            <SessionToken icon={<ActivityIcon isActive={true} />}>
                Active
            </SessionToken>
        </div>
    );
};

export default SessionLevelBar;
