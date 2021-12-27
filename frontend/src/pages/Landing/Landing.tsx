import React, { useEffect } from 'react';
import Snowfall from 'react-snowfall';

import styles from './Landing.module.scss';

export const Landing: React.FC<{}> = ({ children }) => {
    useEffect(() => {
        window.Intercom('update', {
            hide_default_launcher: false,
        });
    }, []);

    return (
        <div className={styles.contentWrapper}>
            <Snowfall />
            {children}
        </div>
    );
};
