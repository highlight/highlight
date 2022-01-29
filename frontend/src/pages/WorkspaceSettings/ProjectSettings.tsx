import classNames from 'classnames/bind';
import React from 'react';
import { Helmet } from 'react-helmet';

import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import { DangerForm } from './DangerForm/DangerForm';
import { FieldsForm } from './FieldsForm/FieldsForm';
import styles from './WorkspaceSettings.module.scss';

const ProjectSettings = () => {
    return (
        <>
            <Helmet>
                <title>Project Settings</title>
            </Helmet>
            <LeadAlignLayout>
                <h2>Project Settings</h2>
                <p className={layoutStyles.subTitle}>
                    {`Manage your project details.`}
                </p>
                <div className={styles.fieldsBox}>
                    <h3>Project Properties</h3>
                    <FieldsForm />
                </div>
                <div className={styles.fieldsBox}>
                    <h3 className={classNames(styles.dangerTitle)}>
                        Danger Zone
                    </h3>
                    <DangerForm />
                </div>
            </LeadAlignLayout>
        </>
    );
};

export default ProjectSettings;
