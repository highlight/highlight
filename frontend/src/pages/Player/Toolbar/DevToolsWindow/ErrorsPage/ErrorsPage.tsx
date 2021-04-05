import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { DevToolsSelect } from '../Option/Option';
import devStyles from '../DevToolsWindow.module.scss';
import styles from './ErrorsPage.module.scss';
import classNames from 'classnames';
import ErrorCard, { ErrorCardState } from './components/ErrorCard/ErrorCard';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import Skeleton from 'react-loading-skeleton';
import ReplayerContext, { ReplayerState } from '../../../ReplayerContext';
import { findLastActiveEventIndex } from './utils/utils';
import { ErrorObject } from '../../../../../graph/generated/schemas';
import ErrorModal from './components/ErrorModal/ErrorModal';
import Modal from '../../../../../components/Modal/Modal';

export interface ErrorsPageHistoryState {
    errorCardIndex: number;
}

const ErrorsPage = () => {
    const [lastActiveErrorIndex, setLastActiveErrorIndex] = useState(-1);
    const virtuoso = useRef<VirtuosoHandle>(null);
    const [isInteractingWithErrors, setIsInteractingWithErrors] = useState(
        false
    );
    const history = useHistory<ErrorsPageHistoryState>();
    const { errors, state, time, replayer } = useContext(ReplayerContext);
    const [selectedError, setSelectedError] = useState<ErrorObject | undefined>(
        undefined
    );

    const loading = state === ReplayerState.Loading;

    /** Only errors recorded after this feature was released will have the timestamp. */
    const hasTimestamp =
        !loading && errors?.every((error) => !!error.timestamp);

    useEffect(() => {
        if (!isInteractingWithErrors && hasTimestamp && replayer) {
            const index = findLastActiveEventIndex(
                time,
                replayer.getMetaData().startTime,
                errors
            );
            setLastActiveErrorIndex(index);
        }
    }, [errors, hasTimestamp, isInteractingWithErrors, replayer, time]);

    useEffect(() => {
        if (virtuoso.current) {
            // Scrolls to the error card the user originally clicked on. This only happens if the user clicked on an error card from the player page which navigates them to the error page. From there there navigate back using the browser's back navigation.
            if (history.location.state?.errorCardIndex !== undefined) {
                virtuoso.current.scrollToIndex(
                    history.location.state.errorCardIndex
                );
            } else {
                virtuoso.current.scrollToIndex(lastActiveErrorIndex);
            }
        }
    }, [history.location.state?.errorCardIndex, lastActiveErrorIndex]);

    return (
        <>
            <div className={classNames(devStyles.topBar)} id={styles.topBar}>
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
                        onMouseEnter={() => {
                            setIsInteractingWithErrors(true);
                        }}
                        onMouseLeave={() => {
                            setIsInteractingWithErrors(false);
                        }}
                        ref={virtuoso}
                        overscan={500}
                        data={errors}
                        itemContent={(index, error) => (
                            <ErrorCard
                                key={error?.id}
                                error={error}
                                state={
                                    hasTimestamp
                                        ? index === lastActiveErrorIndex
                                            ? ErrorCardState.Active
                                            : ErrorCardState.Inactive
                                        : ErrorCardState.Unknown
                                }
                                setSelectedError={() => {
                                    setSelectedError(error);
                                }}
                            />
                        )}
                    />
                )}
            </div>
            <Modal
                title={selectedError?.type || ''}
                visible={!!selectedError}
                onCancel={() => {
                    setSelectedError(undefined);
                }}
                width={'80vw'}
            >
                <ErrorModal error={selectedError!} />
            </Modal>
        </>
    );
};

export default ErrorsPage;
