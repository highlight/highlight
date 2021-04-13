import classNames from 'classnames';
import React, { useContext } from 'react';
import GoToButton from '../../../../../../../components/Button/GoToButton';
import { ErrorObject } from '../../../../../../../graph/generated/schemas';
import ReplayerContext from '../../../../../ReplayerContext';
import styles from './ErrorCard.module.scss';

export enum ErrorCardState {
    Unknown,
    Active,
    Inactive,
}
interface Props {
    error: ErrorObject;
    state: ErrorCardState;
    setSelectedError: () => void;
}

const ErrorCard = ({ error, state, setSelectedError }: Props) => {
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
                    onClick={setSelectedError}
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

const getErrorDescription = (errorObject: ErrorObject): string => {
    const parsedEvent = errorObject.event;
    if (!parsedEvent) {
        return '';
    }
    return (parsedEvent[0] as string) ?? '';
};
