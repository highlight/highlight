import JsonViewer from '@components/JsonViewer/JsonViewer';
import TextHighlighter from '@components/TextHighlighter/TextHighlighter';
import Tooltip from '@components/Tooltip/Tooltip';
import { useParams } from '@util/react-router/useParams';
import { message as AntDesignMessage } from 'antd';
import _ from 'lodash';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Linkify from 'react-linkify';
import Skeleton from 'react-loading-skeleton';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import GoToButton from '../../../../../components/Button/GoToButton';
import Input from '../../../../../components/Input/Input';
import { useGetMessagesQuery } from '../../../../../graph/generated/hooks';
import { ConsoleMessage } from '../../../../../util/shared-types';
import { MillisToMinutesAndSeconds } from '../../../../../util/time';
import { ReplayerState, useReplayerContext } from '../../../ReplayerContext';
import devStyles from '../DevToolsWindow.module.scss';
import { Option } from '../Option/Option';
import styles from './ConsolePage.module.scss';

interface ParsedMessage extends ConsoleMessage {
    selected?: boolean;
    id: number;
}

export const ConsolePage = ({ time }: { time: number }) => {
    const [currentMessage, setCurrentMessage] = useState(-1);
    const [filterSearchTerm, setFilterSearchTerm] = useState('');
    const [options, setOptions] = useState<Array<string>>([]);
    const { pause, replayer, state } = useReplayerContext();
    const [parsedMessages, setParsedMessages] = useState<
        undefined | Array<ParsedMessage>
    >([]);
    const [consoleType, setConsoleType] = useState<string>('All');
    const [isInteractingWithMessages, setIsInteractingWithMessages] = useState(
        false
    );
    const { session_secure_id } = useParams<{ session_secure_id: string }>();
    const { data, loading } = useGetMessagesQuery({
        variables: {
            session_secure_id,
        },
        fetchPolicy: 'no-cache',
    });
    const virtuoso = useRef<VirtuosoHandle>(null);

    useEffect(() => {
        const base = parsedMessages?.map((o) => o.type) ?? [];
        const uniqueSet = new Set(base);
        setOptions(['All', ...Array.from(uniqueSet)]);
    }, [parsedMessages]);

    useEffect(() => {
        setParsedMessages(
            data?.messages?.map((m: ConsoleMessage, i) => {
                return {
                    ...m,
                    id: i,
                };
            }) ?? []
        );
    }, [data]);

    // Logic for scrolling to current entry.
    useEffect(() => {
        if (parsedMessages?.length) {
            let msgIndex = 0;
            let msgDiff: number = Math.abs(time - parsedMessages[0].time);
            for (let i = 0; i < parsedMessages.length; i++) {
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

    const messagesToRender = useMemo(() => {
        if (!currentMessages) {
            return [];
        }

        if (filterSearchTerm !== '') {
            return currentMessages.filter((message) => {
                if (!message.value) {
                    return false;
                }

                switch (typeof message.value) {
                    case 'string':
                        return message.value
                            .toLocaleLowerCase()
                            .includes(filterSearchTerm.toLocaleLowerCase());
                    case 'object':
                        return message.value.some((line: string) => {
                            return line
                                .toString()
                                .toLocaleLowerCase()
                                .includes(filterSearchTerm.toLocaleLowerCase());
                        });
                    default:
                        return false;
                }
            });
        }

        return currentMessages.filter((message) => message?.value?.length);
    }, [currentMessages, filterSearchTerm]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const scrollFunction = useCallback(
        _.debounce((index: number, state) => {
            if (virtuoso.current && state === ReplayerState.Playing) {
                virtuoso.current.scrollToIndex({
                    index,
                    align: 'center',
                    behavior: 'smooth',
                });
            }
        }, 1000 / 60),
        []
    );

    useEffect(() => {
        if (!isInteractingWithMessages) {
            scrollFunction(currentMessage, state);
        }
    }, [scrollFunction, currentMessage, isInteractingWithMessages, state]);

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
                    <div className={styles.filterContainer}>
                        <Input
                            allowClear
                            placeholder="Filter"
                            value={filterSearchTerm}
                            onChange={(event) => {
                                setFilterSearchTerm(event.target.value);
                            }}
                            size="small"
                            disabled={loading || messagesToRender.length === 0}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.consoleStreamWrapper} id="logStreamWrapper">
                {loading ? (
                    <div className={devStyles.skeletonWrapper}>
                        <Skeleton
                            count={2}
                            style={{ height: 25, marginBottom: 11 }}
                        />
                    </div>
                ) : messagesToRender?.length ? (
                    <Virtuoso
                        onMouseEnter={() => {
                            setIsInteractingWithMessages(true);
                        }}
                        onMouseLeave={() => {
                            setIsInteractingWithMessages(false);
                        }}
                        ref={virtuoso}
                        overscan={500}
                        data={messagesToRender}
                        itemContent={(_index, message: ParsedMessage) => (
                            <div key={message.id.toString()}>
                                <div className={styles.consoleMessage}>
                                    <Tooltip title="This is the last logged console message. This is based on the current session time.">
                                        <div
                                            className={
                                                styles.currentIndicatorWrapper
                                            }
                                            style={{
                                                visibility:
                                                    message.id ===
                                                    currentMessage
                                                        ? 'visible'
                                                        : 'hidden',
                                            }}
                                        >
                                            <div
                                                className={
                                                    styles.currentIndicator
                                                }
                                            />
                                        </div>
                                    </Tooltip>
                                    <div className={styles.messageText}>
                                        {message.value && (
                                            <ConsoleRender
                                                m={message.value}
                                                searchTerm={filterSearchTerm}
                                            />
                                        )}
                                    </div>
                                    <GoToButton
                                        className={styles.goToButton}
                                        onClick={() => {
                                            pause(
                                                message.time -
                                                    (replayer?.getMetaData()
                                                        .startTime ?? 0)
                                            );
                                            AntDesignMessage.success(
                                                `Changed player time to when console message was created at ${MillisToMinutesAndSeconds(
                                                    message.time -
                                                        (replayer?.getMetaData()
                                                            .startTime ?? 0)
                                                )}.`
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    />
                ) : messagesToRender.length === 0 && filterSearchTerm !== '' ? (
                    <div className={devStyles.emptySection}>
                        No messages matching '{filterSearchTerm}'
                    </div>
                ) : (
                    <div className={devStyles.emptySection}>
                        There are no console logs for this session.
                    </div>
                )}
            </div>
        </div>
    );
};

const ConsoleRender = ({
    m,
    searchTerm,
}: {
    m: Array<any> | string;
    searchTerm: string;
}) => {
    const input: Array<any> = typeof m === 'string' ? [m] : m;
    const result: Array<string | object> = [];
    // bundle strings together.
    for (let i = 0; i < input.length; i++) {
        if (
            typeof input[i] === 'string' &&
            typeof result[result.length - 1] === 'string'
        ) {
            result[result.length - 1] += ' ' + input[i];
        } else {
            result.push(input[i]);
        }
    }
    return (
        <div>
            {result.map((r) =>
                typeof r === 'object' ? (
                    <JsonViewer name="Object" collapsed src={r} />
                ) : typeof r === 'string' ? (
                    searchTerm === '' ? (
                        <Linkify>{r}</Linkify>
                    ) : (
                        <div className={styles.messageText}>
                            <TextHighlighter
                                searchWords={[searchTerm]}
                                autoEscape={true}
                                textToHighlight={r}
                            />
                        </div>
                    )
                ) : (
                    <div className={styles.messageText}>
                        <Linkify>{JSON.stringify(r)}</Linkify>
                    </div>
                )
            )}
        </div>
    );
};
