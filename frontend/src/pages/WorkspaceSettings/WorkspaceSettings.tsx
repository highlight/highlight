import React from 'react';

import { FieldsForm } from './FieldsForm/FieldsForm';
import styles from './WorkspaceSettings.module.scss';

const WorkspaceSettings = () => {
    return (
        <div className={styles.fieldsBox}>
            <h3>Workspace Properties</h3>
            <FieldsForm />
        </div>
    );
};

export default WorkspaceSettings;
