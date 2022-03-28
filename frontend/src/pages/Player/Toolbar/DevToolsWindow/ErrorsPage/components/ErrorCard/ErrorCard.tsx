import JsonViewer from '@components/JsonViewer/JsonViewer';
import Tag from '@components/Tag/Tag';
import { DetailedPanel } from '@pages/Player/context/PlayerUIContext';
import { message } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

import GoToButton from '../../../../../../../components/Button/GoToButton';
import TextHighlighter from '../../../../../../../components/TextHighlighter/TextHighlighter';
import { ErrorObject } from '../../../../../../../graph/generated/schemas';
import { MillisToMinutesAndSeconds } from '../../../../../../../util/time';
import { ReplayerContextInterface } from '../../../../../ReplayerContext';
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
    searchQuery: string;
    detailedPanel?: DetailedPanel;
    replayerContext: Pick<
        ReplayerContextInterface,
        'sessionMetadata' | 'setTime'
    >;
}

const ErrorCard = React.memo(
    ({
        error,
        setSelectedError,
        searchQuery,
        state,
        detailedPanel,
        replayerContext: { sessionMetadata, setTime },
    }: Props) => {
        const [textAsJson, setTextAsJson] = useState<null | any>(null);

        useEffect(() => {
            if (error.event) {
                const parsedTitle = getErrorDescription(error);
                try {
                    const json = JSON.parse(parsedTitle);
                    if (typeof json === 'object') {
                        setTextAsJson(json);
                    }
                } catch {
                    setTextAsJson(null);
                }
            }
        }, [error]);

        return (
            <button
                key={error.id}
                className={classNames(styles.errorCard, {
                    [styles.active]: detailedPanel?.id === error.id,
                })}
                onClick={setSelectedError}
            >
                <div
                    className={styles.currentIndicatorWrapper}
                    style={{
                        visibility:
                            state === ErrorCardState.Active
                                ? 'visible'
                                : 'hidden',
                    }}
                >
                    <div className={styles.currentIndicator} />
                </div>
                <div>
                    <div className={styles.header}>
                        <Tag
                            infoTooltipText="This is where the error was thrown."
                            backgroundColor="var(--color-orange-300)"
                        >
                            {error.type}
                        </Tag>
                        <p>
                            <TextHighlighter
                                searchWords={[searchQuery]}
                                textToHighlight={error.source || ''}
                            />
                            {error.structured_stack_trace[0] &&
                                ` at line ${error.structured_stack_trace[0].lineNumber}:${error.structured_stack_trace[0].columnNumber}`}
                        </p>
                    </div>
                    <div>
                        <p className={styles.description}>
                            {textAsJson ? (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <JsonViewer
                                        src={textAsJson}
                                        collapsed={1}
                                    />
                                </div>
                            ) : (
                                <TextHighlighter
                                    searchWords={[searchQuery]}
                                    textToHighlight={getErrorDescription(error)}
                                />
                            )}
                        </p>
                    </div>
                </div>
                <div className={styles.actions}>
                    {error.timestamp && (
                        <GoToButton
                            className={styles.goToButton}
                            onClick={(e) => {
                                e.stopPropagation();

                                const dateTimeErrorCreated = new Date(
                                    error.timestamp
                                );
                                const startTime = sessionMetadata.startTime;
                                if (startTime) {
                                    const dateTimeSessionStart = new Date(
                                        startTime
                                    );
                                    const deltaMilliseconds =
                                        dateTimeErrorCreated.getTime() -
                                        dateTimeSessionStart.getTime();
                                    setTime(deltaMilliseconds);

                                    message.success(
                                        `Changed player time to when error was thrown at ${MillisToMinutesAndSeconds(
                                            deltaMilliseconds
                                        )}.`
                                    );
                                }
                            }}
                            label="Goto"
                        />
                    )}
                </div>
            </button>
        );
    }
);

export default ErrorCard;

const getErrorDescription = (errorObject: ErrorObject): string => {
    const parsedEvent = errorObject.event;
    if (!parsedEvent) {
        return '';
    }
    return (parsedEvent[0] as string) ?? '';
};
