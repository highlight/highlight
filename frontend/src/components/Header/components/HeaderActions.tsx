import ThemeToggle from '@components/Header/ThemeToggle/ThemeToggle';
import HighlightGate from '@components/HighlightGate/HighlightGate';
import SvgKeyboardIcon from '@icons/KeyboardIcon';
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext';
import React from 'react';

import { useAuthContext } from '../../../authentication/AuthContext';
import SvgBookIcon from '../../../static/BookIcon';
import Button from '../../Button/Button/Button';
import HelpMenu from '../HelpMenu/HelpMenu';
import Notifications from '../Notifications/Notifications';
import styles from './HeaderActions.module.scss';

const HeaderActions = () => {
    const { isLoggedIn } = useAuthContext();
    const { toggleShowKeyboardShortcutsGuide } = useGlobalContext();

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
                    href="https://docs.highlight.run"
                    type="text"
                    iconButton
                >
                    <SvgBookIcon />
                </Button>
            </div>
            <div>
                <Button
                    trackingId="HeaderShowKeyboardShortcutsGuide"
                    type="text"
                    iconButton
                    onClick={() => {
                        toggleShowKeyboardShortcutsGuide(true);
                    }}
                >
                    <SvgKeyboardIcon />
                </Button>
            </div>
            <HighlightGate>
                <div>
                    <ThemeToggle />
                </div>
            </HighlightGate>
        </div>
    );
};

export default HeaderActions;
