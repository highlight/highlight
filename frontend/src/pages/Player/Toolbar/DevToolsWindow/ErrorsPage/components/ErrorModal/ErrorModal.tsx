import React from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';
import PrimaryButton from '../../../../../../../components/Button/PrimaryButton/PrimaryButton';
import { LoadingBar } from '../../../../../../../components/Loading/Loading';
import { useGetErrorGroupQuery } from '../../../../../../../graph/generated/hooks';
import { ErrorObject } from '../../../../../../../graph/generated/schemas';
import ErrorSessionsTable from '../../../../../../Error/components/ErrorSessionsTable/ErrorSessionsTable';
import { ErrorFrequencyGraph } from '../../../../../../Error/ErrorPage';
import errorPageStyles from '../../../../../../Error/ErrorPage.module.scss';
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
        <div>
            {loading ? (
                <LoadingBar />
            ) : (
                <div>
                    {data && (
                        <>
                            <h2 className={errorPageStyles.subTitle}>
                                Error Frequency
                            </h2>
                            <ErrorFrequencyGraph
                                errorGroup={data.error_group}
                            />
                            <h2 className={errorPageStyles.subTitle}>
                                Related Sessions
                            </h2>
                            <ErrorSessionsTable errorGroup={data.error_group} />
                        </>
                    )}
                    <div className={styles.actionsContainer}>
                        <PrimaryButton
                            onClick={() => {
                                history.push(
                                    `/${organization_id}/errors/${error.error_group_id}`
                                );
                            }}
                        >
                            Error Page
                        </PrimaryButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ErrorModal;
