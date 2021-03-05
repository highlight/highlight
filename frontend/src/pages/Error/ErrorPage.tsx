import React, { useContext, useEffect } from 'react';
import ReactJson from 'react-json-view';
import { useParams } from 'react-router';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import { useGetErrorGroupQuery } from '../../graph/generated/hooks';

import styles from './ErrorPage.module.scss';

export const ErrorPage = () => {
    const { error_id } = useParams<{ error_id: string }>();
    const { setOpenSidebar } = useContext(SidebarContext);
    useEffect(() => {
        setOpenSidebar(true);
    }, [setOpenSidebar]);
    const { data } = useGetErrorGroupQuery({
        variables: { id: error_id },
    });
    return (
        <div className={styles.errorPageWrapper}>
            <div className={styles.blankSidebar} />
            <div className={styles.errorPage}>
                <ReactJson src={data ?? {}} />
            </div>
        </div>
    );
};
