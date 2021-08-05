import React from 'react';

import { useAuthContext } from '../../../AuthContext';
import HelpMenu from '../HelpMenu/HelpMenu';
import Notifications from '../Notifications/Notifications';
import styles from './HeaderActions.module.scss';

const HeaderActions = () => {
    const { isLoggedIn } = useAuthContext();

    return (
        <div className={styles.headerActions}>
            {isLoggedIn && (
                <div>
                    <Notifications />
                </div>
            )}
            <div>
                <HelpMenu />
            </div>
        </div>
    );
};

export default HeaderActions;
