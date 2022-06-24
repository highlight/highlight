import { RageClicksForm } from '@pages/WorkspaceSettings/RageClicksForm/RageClicksForm';
import SourcemapSettings from '@pages/WorkspaceSettings/SourcemapSettings/SourcemapSettings';
import classNames from 'classnames/bind';
import React from 'react';
import { Helmet } from 'react-helmet';

import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import { DangerForm } from './DangerForm/DangerForm';
import { ExcludedUsersForm } from './ExcludedUsersForm/ExcludedUsersForm';
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
                    <h3>Excluded Sessions</h3>
                    <ExcludedUsersForm />
                </div>
                <div className={styles.fieldsBox}>
                    <h3>Rage Clicks</h3>
                    <RageClicksForm />
                </div>
                <div className={styles.fieldsBox} id="sourcemaps">
                    <h3>Sourcemaps</h3>
                    <SourcemapSettings />
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
