import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { Option, DevToolsSelect } from '../Option/Option';
import { ConsoleMessage } from '../../../../../util/shared-types';

import styles from './ConsolePage.module.scss';
import devStyles from '../DevToolsWindow.module.scss';
import { DemoContext } from '../../../../../DemoContext';
import GoToButton from '../../../../../components/Button/GoToButton';
import ReplayerContext from '../../../ReplayerContext';
import { useGetMessagesQuery } from '../../../../../graph/generated/hooks';
import { Virtuoso } from 'react-virtuoso';

export const ConsolePage = ({ time }: { time: number }) => {
    const [currentMessage, setCurrentMessage] = useState(-1);
    const [options, setOptions] = useState<Array<string>>([]);
    const { demo } = useContext(DemoContext);
    const { pause, replayer } = useContext(ReplayerContext);
    const [parsedMessages, setParsedMessages] = useState<
        undefined | Array<ConsoleMessage & { selected?: boolean; id: number }>
    >([]);
    const [consoleType, setConsoleType] = useState<string>('All');
    const { session_id } = useParams<{ session_id: string }>();
    const { data, loading } = useGetMessagesQuery({
        variables: {
            session_id: demo
                ? process.env.REACT_APP_DEMO_SESSION ?? ''
                : session_id,
        },
        context: { headers: { 'Highlight-Demo': demo } },
    });

    const rawMessages = data?.messages;

    useEffect(() => {
        const base = parsedMessages?.map((o) => o.type) ?? [];
        const uniqueSet = new Set(base);
        setOptions(['All', ...Array.from(uniqueSet)]);
    }, [parsedMessages]);

    useEffect(() => {
        setParsedMessages(
            rawMessages?.map((m, i) => {
                return { ...m, id: i };
            })
        );
    }, [rawMessages]);

    // Logic for scrolling to current entry.
    useEffect(() => {
        if (parsedMessages?.length) {
            var msgIndex: number = 0;
            var msgDiff: number = Math.abs(time - parsedMessages[0].time);
            for (var i = 0; i < parsedMessages.length; i++) {
                const currentDiff: number = Math.abs(
                    time - parsedMessages[i].time
                );
                if (currentDiff < msgDiff) {
                    msgIndex = i;
                    msgDiff = currentDiff;
                }
            }
            if (currentMessage !== msgIndex) {
                setCurrentMessage(msgIndex);
            }
        }
    }, [currentMessage, time, parsedMessages]);

    const currentMessages = parsedMessages?.filter((m) => {
        // if the console type is 'all', let all messages through. otherwise, filter.
        if (consoleType === 'All') {
            return true;
        } else if (m.type === consoleType) {
            return true;
        }
        return false;
    });

    const messagesToRender = useMemo(
        () => currentMessages?.filter((message) => message?.value.length) || [],
        [currentMessages]
    );

    return (
        <div className={styles.consolePageWrapper}>
            <div className={devStyles.topBar}>
                <div className={devStyles.optionsWrapper}>
                    {options.map((o: string, i: number) => {
                        return (
                            <Option
                                key={i}
                                onSelect={() => setConsoleType(o)}
                                selected={o === consoleType}
                                optionValue={o}
                            />
                        );
                    })}
                </div>
                <DevToolsSelect isConsole={true} />
            </div>
            <div className={styles.consoleStreamWrapper} id="logStreamWrapper">
                {loading ? (
                    <div className={devStyles.skeletonWrapper}>
                        <Skeleton
                            count={2}
                            style={{ height: 25, marginBottom: 11 }}
                        />
                    </div>
                ) : currentMessages?.length ? (
                    <Virtuoso
                        data={messagesToRender}
                        itemContent={(_index, message) => (
                            <div key={message.id.toString()}>
                                <div
                                    className={styles.consoleMessage}
                                    style={{
                                        color:
                                            message.id === currentMessage
                                                ? 'black'
                                                : 'grey',
                                        fontWeight:
                                            message.id === currentMessage
                                                ? 400
                                                : 300,
                                    }}
                                >
                                    <div
                                        className={
                                            styles.currentIndicatorWrapper
                                        }
                                        style={{
                                            visibility:
                                                message.id === currentMessage
                                                    ? 'visible'
                                                    : 'hidden',
                                        }}
                                    >
                                        <div
                                            className={styles.currentIndicator}
                                        />
                                    </div>
                                    <div className={styles.messageText}>
                                        {typeof message.value === 'string' &&
                                            message.value}
                                    </div>
                                    <GoToButton
                                        className={styles.goToButton}
                                        onClick={() => {
                                            pause(
                                                message.time -
                                                    (replayer?.getMetaData()
                                                        .startTime ?? 0)
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    />
                ) : (
                    <div className={devStyles.emptySection}>
                        No logs for this section.
                    </div>
                )}
            </div>
        </div>
    );
};
