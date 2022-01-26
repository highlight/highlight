import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames/bind';
import React from 'react';
import { Helmet } from 'react-helmet';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import { DangerForm } from './DangerForm/DangerForm';
import { FieldsForm } from './FieldsForm/FieldsForm';
import styles from './WorkspaceSettings.module.scss';

const ProjectSettings = () => {
    const { workspace_id } = useParams<{ workspace_id: string }>();
    const isWorkspace = !!workspace_id;
    const pageType = isWorkspace ? 'workspace' : 'project';
    const pageTypeCaps = isWorkspace ? 'Workspace' : 'Project';

    return (
        <>
            <Helmet>
                <title>{pageTypeCaps} Settings</title>
            </Helmet>
            <h2>{`${pageTypeCaps} Settings`}</h2>
            <p className={layoutStyles.subTitle}>
                {`Manage your ${pageType} details.`}
            </p>
            <div className={styles.fieldsBox}>
                <h3>{`${pageTypeCaps} Fields`}</h3>
                <FieldsForm />
            </div>
            {/* Show delete for project-level settings only */}
            {!workspace_id && (
                <div className={styles.fieldsBox}>
                    <h3 className={classNames(styles.dangerTitle)}>
                        Danger Zone
                    </h3>
                    <DangerForm />
                </div>
            )}
        </>
    );
};

export default ProjectSettings;
