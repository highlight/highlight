import React, { useContext, useEffect } from 'react';

import styles from './WorkspaceSettings.module.scss';
import classNames from 'classnames/bind';
import { FieldsForm } from './FieldsForm/FieldsForm';
import { DangerForm } from './DangerForm/DangerForm';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import { IgnoreSettings } from './IgnoreSettings/IgnoreSettings';

export const WorkspaceSettings = () => {
    const { setOpenSidebar } = useContext(SidebarContext);

    useEffect(() => {
        setOpenSidebar(true);
    }, [setOpenSidebar]);
    return (
        <div className={styles.settingsPageWrapper}>
            <div className={styles.blankSidebar}></div>
            <div className={styles.settingsPage}>
                <div className={styles.title}>Workspace Settings</div>
                <div className={styles.subTitle}>
                    Manage your workspace details.
                </div>
                <div className={styles.fieldsBox}>
                    <div className={styles.boxTitle}>Workspace Fields</div>
                    <FieldsForm />
                </div>
                <div className={styles.fieldsBox}>
                    <div className={styles.title}>Session Settings</div>
                    <div className={styles.subTitle}>
                        Emails and partial emails below will be ignored in your sessions. (ex: test@test.com, domain.com, ...)
                    </div>
                    <IgnoreSettings />
                </div>
                <div className={styles.fieldsBox}>
                    <div
                        className={classNames(
                            styles.boxTitle,
                            styles.dangerTitle
                        )}
                    >
                        Danger Zone
                    </div>
                    <DangerForm />
                </div>
            </div>
        </div>
    );
};
