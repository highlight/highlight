import React from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';

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
}

const ErrorModal = ({ error }: Props) => {
    const { data, loading } = useGetErrorGroupQuery({
        variables: { id: error.error_group_id.toString() },
    });
    const history = useHistory();
    const { organization_id } = useParams<{ organization_id: string }>();

    return (
        <div className={styles.container}>
            {loading ? (
                <LoadingBar />
            ) : (
                <div>
                    {data && (
                        <>
                            <div className={styles.titleContainer}>
                                <ErrorTitle errorGroup={data.error_group} />
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
                                    `/${organization_id}/errors/${error.error_group_id}`
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
