import React from 'react';

import { useAuthContext } from '../../../authentication/AuthContext';
import SvgBookIcon from '../../../static/BookIcon';
import Button from '../../Button/Button/Button';
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
            <div>
                <Button
                    trackingId="HeaderDocumentation"
                    href="https://docs.highlight.run/docs"
                    type="text"
                    iconButton
                >
                    <SvgBookIcon />
                </Button>
            </div>
        </div>
    );
};

export default HeaderActions;
