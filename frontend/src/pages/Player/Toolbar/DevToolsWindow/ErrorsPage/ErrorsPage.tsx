import React, { useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useGetErrorsQuery } from '../../../../../graph/generated/hooks';
import { DevToolsSelect } from '../Option/Option';
import devStyles from '../DevToolsWindow.module.scss';
import styles from './ErrorsPage.module.scss';
import classNames from 'classnames';
import ErrorCard from './components/ErrorCard/ErrorCard';
import { ErrorObject } from '../../../../../graph/generated/schemas';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import Skeleton from 'react-loading-skeleton';

export interface ErrorsPageHistoryState {
    errorCardIndex: number;
}

const ErrorsPage = () => {
    const { session_id } = useParams<{ session_id: string }>();
    const { loading, data } = useGetErrorsQuery({ variables: { session_id } });
    const virtuoso = useRef<VirtuosoHandle>(null);
    const history = useHistory<ErrorsPageHistoryState>();

    const errors = data?.errors as ErrorObject[];

    // Scrolls to the error card the user originally clicked on. This only happens if the user clicked on an error card from the player page which navigates them to the error page. From there there navigate back using the browser's back navigation.
    useEffect(() => {
        if (
            history.location.state?.errorCardIndex !== undefined &&
            virtuoso.current
        ) {
            virtuoso.current?.scrollToIndex(
                history.location.state.errorCardIndex
            );
        }
    }, [history.location.state?.errorCardIndex]);

    return (
        <>
            <div className={classNames(devStyles.topBar, styles.topBar)}>
                <DevToolsSelect />
            </div>
            <div className={styles.errorList}>
                {loading ? (
                    <div className={styles.skeleton}>
                        <Skeleton
                            count={2}
                            style={{ height: 25, marginBottom: 11 }}
                        />
                    </div>
                ) : !errors.length ? (
                    <div className={devStyles.emptySection}>
                        No errors for this section.
                    </div>
                ) : (
                    <Virtuoso
                        ref={virtuoso}
                        overscan={500}
                        data={errors}
                        itemContent={(index, error) => (
                            <ErrorCard
                                key={error?.id}
                                error={error as ErrorObject}
                                index={index}
                            />
                        )}
                    />
                )}
            </div>
        </>
    );
};

export default ErrorsPage;
