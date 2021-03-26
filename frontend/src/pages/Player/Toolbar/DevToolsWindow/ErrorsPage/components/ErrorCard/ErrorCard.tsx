import classNames from 'classnames';
import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import GoToButton from '../../../../../../../components/Button/GoToButton';
import { ErrorObject } from '../../../../../../../graph/generated/schemas';
import ReplayerContext from '../../../../../ReplayerContext';
import { ErrorsPageHistoryState } from '../../ErrorsPage';
import styles from './ErrorCard.module.scss';

export enum ErrorCardState {
    Unknown,
    Active,
    Inactive,
}
interface Props {
    error: ErrorObject;
    /** The index of this error card relative to the other error cards. */
    index: number;
    state: ErrorCardState;
}

const ErrorCard = ({ error, index, state }: Props) => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const history = useHistory<ErrorsPageHistoryState>();
    const { replayer, setTime } = useContext(ReplayerContext);

    return (
        <div
            key={error.id}
            className={classNames(styles.errorCard, {
                [styles.inactive]: state === ErrorCardState.Inactive,
            })}
        >
            <div>
                <div className={styles.header}>
                    <h4>{error.type}</h4>
                    <p>
                        {error.source} at line {error.line_number}:
                        {error.column_number}
                    </p>
                </div>
                <div>
                    <p className={styles.description}>
                        {getErrorDescription(error)}
                    </p>
                </div>
            </div>
            <div className={styles.actions}>
                <GoToButton
                    className={styles.goToButton}
                    onClick={() => {
                        // Sets the index so if the user navigates back to the player page, the error card they clicked on will be in view.
                        history.replace(window.location.pathname, {
                            errorCardIndex: index,
                        });
                        history.push(
                            `/${organization_id}/errors/${error.error_group_id}`
                        );
                    }}
                    label="More"
                />
                {error.timestamp && (
                    <GoToButton
                        className={styles.goToButton}
                        onClick={() => {
                            const dateTimeErrorCreated = new Date(
                                error.timestamp
                            );
                            const startTime = replayer?.getMetaData().startTime;
                            if (startTime) {
                                const dateTimeSessionStart = new Date(
                                    startTime
                                );
                                const deltaMilliseconds =
                                    dateTimeErrorCreated.getTime() -
                                    dateTimeSessionStart.getTime();
                                setTime(deltaMilliseconds);
                            }
                        }}
                        label="Goto"
                    />
                )}
            </div>
        </div>
    );
};

export default ErrorCard;

const getErrorDescription = (errorObject: ErrorObject) => {
    if (!errorObject.event) {
        return '';
    }
    const parsedEvent = JSON.parse(errorObject.event);
    console.log({ parsedEvent });

    if (Array.isArray(parsedEvent) && parsedEvent.length > 0) {
        if (parsedEvent[0].message) {
            return parsedEvent[0].message;
        }
        return parsedEvent[0].toString();
    }

    return parsedEvent.toString();
};
