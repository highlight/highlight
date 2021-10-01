import { useParams } from '@util/react-router/useParams';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';

import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { CircularSpinner, LoadingBar } from '../../components/Loading/Loading';
import {
    useAddAdminToProjectMutation,
    useAddAdminToWorkspaceMutation,
    useGetAdminQuery,
} from '../../graph/generated/hooks';
import { auth } from '../../util/auth';
import { client } from '../../util/graph';
import styles from './NewMemberPage.module.scss';

const NewMemberPage = () => {
    const { invite_id, project_id, workspace_id } = useParams<{
        project_id: string;
        workspace_id: string;
        invite_id: string;
    }>();
    const isProject = !!project_id;
    const [adminAdded, setAdminAdded] = useState(false);
    const addAdminMutation = isProject
        ? useAddAdminToProjectMutation
        : useAddAdminToWorkspaceMutation;
    const [addAdmin, { loading: addLoading }] = addAdminMutation();
    const { loading: adminLoading, data: adminData } = useGetAdminQuery();

    if (adminAdded && isProject) {
        return <Redirect to={`/${project_id}/setup`} />;
    } else if (adminAdded) {
        return <Redirect to={`/w/${workspace_id}/setup`} />;
    }

    if (adminLoading) {
        return <LoadingBar />;
    }

    return (
        <div className={styles.box}>
            <h2>Accept project invite?</h2>
            <p className={styles.subTitle}>
                Would you like to enter this project as '
                {adminData?.admin?.email}' ?
            </p>
            <Button
                trackingId="NewMemberEnterWorkspace"
                type="primary"
                className={commonStyles.submitButton}
                onClick={() => {
                    addAdmin({
                        variables: {
                            project_id,
                            workspace_id,
                            invite_id,
                        },
                    }).then(() => {
                        setAdminAdded(true);
                    });
                }}
            >
                {addLoading ? (
                    <CircularSpinner
                        style={{
                            fontSize: 18,
                            color: 'var(--text-primary-inverted)',
                        }}
                    />
                ) : (
                    'Join Project'
                )}
            </Button>
            <Button
                trackingId="NewMemberLoginWithDifferentUser"
                className={commonStyles.secondaryButton}
                style={{ marginTop: 16 }}
                onClick={() => {
                    auth.signOut();
                    client.cache.reset();
                }}
            >
                Login as different User
            </Button>
        </div>
    );
};

export default NewMemberPage;
