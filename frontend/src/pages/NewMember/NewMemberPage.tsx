import Alert from '@components/Alert/Alert';
import { useAppLoadingContext } from '@context/AppLoadingContext';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';

import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { CircularSpinner } from '../../components/Loading/Loading';
import {
    useAddAdminToWorkspaceMutation,
    useGetAdminQuery,
} from '../../graph/generated/hooks';
import { auth } from '../../util/auth';
import { client } from '../../util/graph';
import styles from './NewMemberPage.module.scss';

const NewMemberPage = () => {
    const { invite_id, workspace_id } = useParams<{
        workspace_id: string;
        invite_id: string;
    }>();
    const [adminAdded, setAdminAdded] = useState(false);
    const addAdminMutation = useAddAdminToWorkspaceMutation;
    const [addAdmin, { loading: addLoading }] = addAdminMutation();
    const { loading: adminLoading, data: adminData } = useGetAdminQuery();
    const { setIsLoading } = useAppLoadingContext();
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!adminLoading) {
            setIsLoading(false);
        }
    }, [adminLoading, setIsLoading]);

    if (adminAdded) {
        return <Redirect to={`/w/${workspace_id}`} />;
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
                    setHasError(false);
                    addAdmin({
                        variables: {
                            workspace_id,
                            invite_id,
                        },
                    }).then((result) => {
                        if (result.data?.addAdminToWorkspace) {
                            setAdminAdded(true);
                        } else {
                            setHasError(true);
                        }
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
                    client.clearStore();
                }}
            >
                Login as different User
            </Button>

            {hasError && (
                <Alert
                    shouldAlwaysShow
                    type="error"
                    trackingId="NewMemberPageError"
                    message="A problem occurred while trying to join the project."
                    description="This is usually an intermittent issue. If this keeps happening to you feel free to reach out to us!"
                />
            )}
        </div>
    );
};

export default NewMemberPage;
