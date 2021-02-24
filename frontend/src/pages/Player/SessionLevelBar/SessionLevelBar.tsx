import React from 'react';
import styles from './SessionLevelBar.module.scss';
import SessionToken from './SessionToken/SessionToken';
import { ReactComponent as BrowserIcon } from '../../../static/browser.svg';
import { ReactComponent as URLIcon } from '../../../static/link.svg';
import ActivityIcon from './ActivityIcon/ActivityIcon';

interface Props {
    isTabActive: boolean;
    currentUrl: string;
    currentResolution: { height: number; width: number };
}

const SessionLevelBar = ({
    currentResolution,
    currentUrl,
    isTabActive,
}: Props) => {
    return (
        <div className={styles.sessionLevelBarContainer}>
            <SessionToken icon={<BrowserIcon />}>
                {currentResolution.height} x {currentResolution.width}
            </SessionToken>
            <SessionToken icon={<URLIcon />}>{currentUrl}</SessionToken>
            <SessionToken icon={<ActivityIcon isActive={isTabActive} />}>
                {isTabActive ? 'Active' : 'Inactive'}
            </SessionToken>
        </div>
    );
};

export default SessionLevelBar;
