import React, { useContext, useEffect } from 'react';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';

import styles from './ErrorPage.module.scss';

export const ErrorPage = () => {
    const { setOpenSidebar } = useContext(SidebarContext);
    useEffect(() => {
        setOpenSidebar(true);
    }, [setOpenSidebar]);
    return <p className={styles.error}>hello</p>;
};
