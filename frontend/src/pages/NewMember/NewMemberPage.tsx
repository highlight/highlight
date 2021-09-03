import { useParams } from '@util/react-router/useParams';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';

import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { CircularSpinner, LoadingBar } from '../../components/Loading/Loading';
import {
    useAddAdminToOrganizationMutation,
    useGetAdminQuery,
} from '../../graph/generated/hooks';
import { auth } from '../../util/auth';
import { client } from '../../util/graph';
import styles from './NewMemberPage.module.scss';

const NewMemberPage = () => {
    const { invite_id, organization_id } = useParams<{
        organization_id: string;
        invite_id: string;
    }>();
    const [adminAdded, setAdminAdded] = useState(false);
    const [
        addAdmin,
        { loading: addLoading },
    ] = useAddAdminToOrganizationMutation();
    const { loading: adminLoading, data: adminData } = useGetAdminQuery();
    if (adminAdded) {
        return <Redirect to={`/${organization_id}/setup`} />;
    }
    if (adminLoading) {
        return <LoadingBar />;
    }

    return (
        <div className={styles.box}>
            <h2>Accept workspace invite?</h2>
            <p className={styles.subTitle}>
                Would you like to enter this workspace as '
                {adminData?.admin?.email}' ?
            </p>
            <Button
                trackingId="NewMemberEnterWorkspace"
                type="primary"
                className={commonStyles.submitButton}
                onClick={() => {
                    addAdmin({
                        variables: {
                            organization_id: organization_id,
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
                    'Enter Workspace'
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
