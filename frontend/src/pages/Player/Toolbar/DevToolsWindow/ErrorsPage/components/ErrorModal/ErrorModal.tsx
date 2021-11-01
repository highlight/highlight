import Alert from '@components/Alert/Alert';
import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { useParams } from '@util/react-router/useParams';
import React from 'react';
import { useHistory } from 'react-router';

import Button from '../../../../../../../components/Button/Button/Button';
import { LoadingBar } from '../../../../../../../components/Loading/Loading';
import { useGetErrorGroupQuery } from '../../../../../../../graph/generated/hooks';
import { ErrorObject } from '../../../../../../../graph/generated/schemas';
import ErrorDescription from '../../../../../../Error/components/ErrorDescription/ErrorDescription';
import ErrorTitle from '../../../../../../Error/components/ErrorTitle/ErrorTitle';
import StackTraceSection from '../../../../../../Error/components/StackTraceSection/StackTraceSection';
import { ErrorFrequencyGraph } from '../../../../../../Error/ErrorPage';
import styles from './ErrorModal.module.scss';

interface Props {
    error: ErrorObject;
    showRequestAlert: boolean;
}

const ErrorModal = ({ error, showRequestAlert }: Props) => {
    const { data, loading } = useGetErrorGroupQuery({
        variables: { secure_id: error.error_group_secure_id },
    });
    const history = useHistory();
    const { project_id } = useParams<{ project_id: string }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;

    return (
        <div className={styles.container}>
            {loading ? (
                <div className={styles.loadingBarContainer}>
                    <LoadingBar />
                </div>
            ) : (
                <div>
                    {data && (
                        <>
                            {showRequestAlert && (
                                <Alert
                                    type="error"
                                    trackingId="UnmatchedBackendError"
                                    message="Request data not found"
                                    className={styles.alertContainer}
                                    description={
                                        <>
                                            The network resource associated with
                                            this error could not be found. This
                                            could happen if the backend url was
                                            not added to the tracing origins, or
                                            if the user's browser failed to push
                                            the network resource data while the
                                            session was being recorded.
                                        </>
                                    }
                                />
                            )}

                            <div className={styles.titleContainer}>
                                <ErrorTitle
                                    errorGroup={data.error_group}
                                    showShareButton={false}
                                />
                            </div>

                            <div className={styles.errorDescriptionContainer}>
                                <ErrorDescription
                                    errorGroup={data.error_group}
                                />
                            </div>

                            <h3>Stack Trace</h3>
                            <StackTraceSection
                                errorGroup={data.error_group}
                                loading={loading}
                            />

                            <ErrorFrequencyGraph
                                errorGroup={data.error_group}
                            />
                        </>
                    )}
                    <div className={styles.actionsContainer}>
                        <Button
                            trackingId="GoToErrorPageFromSessionErrorModal"
                            type="primary"
                            onClick={() => {
                                history.push(
                                    `/${projectIdRemapped}/errors/${error.error_group_secure_id}`
                                );
                            }}
                        >
                            Error Page
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ErrorModal;
