import React from 'react';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import { FieldsForm } from './FieldsForm/FieldsForm';
import styles from './WorkspaceSettings.module.scss';

const WorkspaceSettings = () => {
    return (
        <>
            <div className={styles.titleContainer}>
                <div>
                    <h3>Properties</h3>
                    <p className={layoutStyles.subTitle}>
                        Manage your workspace details.
                    </p>
                </div>
            </div>
            <div className={styles.fieldsBox}>
                <FieldsForm />
            </div>
        </>
    );
};

export default WorkspaceSettings;
