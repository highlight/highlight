import classNames from 'classnames/bind';
import React from 'react';

import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import { DangerForm } from './DangerForm/DangerForm';
import { FieldsForm } from './FieldsForm/FieldsForm';
import styles from './WorkspaceSettings.module.scss';

const WorkspaceSettings = () => {
    return (
        <LeadAlignLayout>
            <h2>Workspace Settings</h2>
            <p className={styles.subTitle}>Manage your workspace details.</p>
            <div className={styles.fieldsBox}>
                <h3>Workspace Fields</h3>
                <FieldsForm />
            </div>
            <div className={styles.fieldsBox}>
                <h3 className={classNames(styles.dangerTitle)}>Danger Zone</h3>
                <DangerForm />
            </div>
        </LeadAlignLayout>
    );
};

export default WorkspaceSettings;
