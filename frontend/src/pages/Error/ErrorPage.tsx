import {
    queryBuilderEnabled,
    useAuthContext,
} from '@authentication/AuthContext';
import { ErrorState } from '@components/ErrorState/ErrorState';
import { SessionPageSearchParams } from '@pages/Player/utils/utils';
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext';
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import classNames from 'classnames';
import { H } from 'highlight.run';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';
import { useHistory } from 'react-router';
import { useLocalStorage } from 'react-use';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';

import Button from '../../components/Button/Button/Button';
import { StandardDropdown } from '../../components/Dropdown/StandardDropdown/StandardDropdown';
import { RechartTooltip } from '../../components/recharts/RechartTooltip/RechartTooltip';
import Tooltip from '../../components/Tooltip/Tooltip';
import {
    useGetDailyErrorFrequencyQuery,
    useGetErrorGroupQuery,
} from '../../graph/generated/hooks';
import { ErrorGroup, Maybe } from '../../graph/generated/schemas';
import SvgDownloadIcon from '../../static/DownloadIcon';
import {
    ErrorSearchContextProvider,
    ErrorSearchParams,
} from '../Errors/ErrorSearchContext/ErrorSearchContext';
import { EmptyErrorsSearchParams } from '../Errors/ErrorsPage';
import { IntegrationCard } from '../Sessions/IntegrationCard/IntegrationCard';
import ErrorDescription from './components/ErrorDescription/ErrorDescription';
import { parseErrorDescriptionList } from './components/ErrorDescription/utils/utils';
import ErrorAffectedUsers from './components/ErrorRightPanel/components/ErrorAffectedUsers/ErrorAffectedUsers';
import NoActiveErrorCard from './components/ErrorRightPanel/components/NoActiveErrorCard/NoActiveErrorCard';
import ErrorRightPanel from './components/ErrorRightPanel/ErrorRightPanel';
import ErrorSearchPanel from './components/ErrorSearchPanel/ErrorSearchPanel';
import ErrorTitle from './components/ErrorTitle/ErrorTitle';
import StackTraceSection from './components/StackTraceSection/StackTraceSection';
import styles from './ErrorPage.module.scss';
import useErrorPageConfiguration from './utils/ErrorPageUIConfiguration';

const ErrorPage = ({ integrated }: { integrated: boolean }) => {
    const { error_secure_id, project_id } = useParams<{
        error_secure_id: string;
        project_id: string;
    }>();
    const history = useHistory();
    const { queryBuilderInput, setQueryBuilderInput } = useSearchContext();

    const { showBanner } = useGlobalContext();

    const { isLoggedIn, isHighlightAdmin } = useAuthContext();
    const {
        data,
        loading,
        error: errorQueryingErrorGroup,
    } = useGetErrorGroupQuery({
        variables: { secure_id: error_secure_id },
        skip: !error_secure_id,
        onCompleted: () => {
            H.track('Viewed error', { is_guest: !isLoggedIn });
        },
    });
    const [segmentName, setSegmentName] = useState<string | null>(null);
    const [cachedParams, setCachedParams] = useLocalStorage<ErrorSearchParams>(
        `cachedErrorParams-v2-${
            segmentName || 'no-selected-segment'
        }-${project_id}`,
        {}
    );
    const [searchParams, setSearchParams] = useState<ErrorSearchParams>(
        cachedParams || EmptyErrorsSearchParams
    );
    const [existingParams, setExistingParams] = useState<ErrorSearchParams>({});
    const newCommentModalRef = useRef<HTMLDivElement>(null);
    const dateFromSearchParams = new URLSearchParams(location.search).get(
        SessionPageSearchParams.date
    );

    useEffect(() => setCachedParams(searchParams), [
        searchParams,
        setCachedParams,
    ]);

    useEffect(() => {
        if (dateFromSearchParams) {
            const start_date = moment(dateFromSearchParams);
            const end_date = moment(dateFromSearchParams);

            setSearchParams(() => ({
                // We are explicitly clearing any existing search params so the only applied search param is the date range.
                ...EmptyErrorsSearchParams,
                date_range: {
                    start_date: start_date
                        .startOf('day')
                        .subtract(1, 'days')
                        .toDate(),
                    end_date: end_date.endOf('day').toDate(),
                },
            }));
            message.success(
                `Showing errors that were thrown on ${dateFromSearchParams}`
            );
            history.replace({ search: '' });
        }
    }, [history, dateFromSearchParams, setSearchParams]);

    useEffect(() => {
        if (queryBuilderInput?.type === 'errors') {
            const searchParams = {
                ...EmptyErrorsSearchParams,
                query: JSON.stringify(queryBuilderInput),
            };
            setExistingParams(searchParams);
            setSearchParams(searchParams);
            setQueryBuilderInput(undefined);
        }
    }, [queryBuilderInput, setQueryBuilderInput]);

    const { showLeftPanel } = useErrorPageConfiguration();

    const isQueryBuilder = queryBuilderEnabled(isHighlightAdmin, project_id);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <ErrorSearchContextProvider
            value={{
                searchParams,
                setSearchParams,
                existingParams,
                setExistingParams,
                segmentName,
                setSegmentName,
                isQueryBuilder,
                searchQuery,
                setSearchQuery,
            }}
        >
            <Helmet>
                <title>Errors</title>
            </Helmet>
            {!integrated && <IntegrationCard />}
            <div
                className={classNames(styles.errorPage, {
                    [styles.withoutLeftPanel]: !showLeftPanel,
                    [styles.empty]: !error_secure_id || errorQueryingErrorGroup,
                    [styles.withErrorState]: errorQueryingErrorGroup,
                })}
            >
                <div
                    className={classNames(styles.errorPageLeftColumn, {
                        [styles.hidden]: !showLeftPanel,
                    })}
                >
                    <ErrorSearchPanel />
                </div>
                {error_secure_id && !errorQueryingErrorGroup ? (
                    <>
                        <Helmet>
                            <title>
                                Errors:{' '}
                                {getHeaderFromError(
                                    data?.error_group?.event ?? []
                                )}
                            </title>
                        </Helmet>
                        <div
                            className={classNames(
                                styles.errorPageCenterColumn,
                                {
                                    [styles.hidden]: !showLeftPanel,
                                    [styles.bannerShown]: showBanner,
                                }
                            )}
                        >
                            <div className={styles.titleContainer}>
                                {loading ? (
                                    <Skeleton
                                        count={1}
                                        style={{ width: 300, height: 37 }}
                                    />
                                ) : (
                                    <ErrorTitle
                                        errorGroup={data?.error_group}
                                    />
                                )}
                            </div>
                            <div className={styles.eventText}>
                                {loading ? (
                                    <Skeleton
                                        count={1}
                                        style={{
                                            height: '2ch',
                                            marginBottom: 0,
                                        }}
                                    />
                                ) : (
                                    <ErrorDescription
                                        errorGroup={data?.error_group}
                                    />
                                )}
                            </div>
                            <h3 className={styles.titleWithAction}>
                                Stack Trace
                                <Tooltip title="Download the stack trace">
                                    <Button
                                        trackingId="DownloadErrorStackTrace"
                                        iconButton
                                        type="text"
                                        disabled={loading}
                                        onClick={() => {
                                            if (data?.error_group) {
                                                let stackTraceStr =
                                                    data.error_group
                                                        .stack_trace || '';
                                                let isJson = true;

                                                if (
                                                    data.error_group
                                                        .structured_stack_trace
                                                        ?.length > 0
                                                ) {
                                                    const traceLines = data.error_group.structured_stack_trace.map(
                                                        (stack_trace) => {
                                                            return `${stack_trace?.fileName} in ${stack_trace?.functionName} at line ${stack_trace?.lineNumber}:${stack_trace?.columnNumber}`;
                                                        }
                                                    );
                                                    stackTraceStr = JSON.stringify(
                                                        traceLines,
                                                        undefined,
                                                        2
                                                    );
                                                } else {
                                                    try {
                                                        JSON.parse(
                                                            stackTraceStr
                                                        );
                                                    } catch {
                                                        isJson = false;
                                                    }
                                                }

                                                const a = document.createElement(
                                                    'a'
                                                );
                                                const file = new Blob(
                                                    [stackTraceStr],
                                                    {
                                                        type: isJson
                                                            ? 'application/json'
                                                            : 'text/plain',
                                                    }
                                                );

                                                a.href = URL.createObjectURL(
                                                    file
                                                );
                                                a.download = `stack-trace-for-error-${error_secure_id}.${
                                                    isJson ? 'json' : 'txt'
                                                }`;
                                                a.click();

                                                URL.revokeObjectURL(a.href);
                                            }
                                        }}
                                    >
                                        <SvgDownloadIcon />
                                    </Button>
                                </Tooltip>
                            </h3>
                            <div className={styles.fieldWrapper}>
                                <StackTraceSection
                                    loading={loading}
                                    errorGroup={
                                        {
                                            created_at:
                                                '2022-02-05T08:41:05.425607Z',
                                            id: '519367',
                                            secure_id:
                                                'iKaJcO5dGDLkreqjaXETBvrLpMj0',
                                            type: 'console.error',
                                            project_id: 1,
                                            event: [
                                                '"TypeError: null is not an object (evaluating \'n.defaultView.scrollTo\')"',
                                            ],
                                            state: 'OPEN',
                                            structured_stack_trace: [
                                                {
                                                    fileName:
                                                        'https://app.highlight.run/static/highlightLib/src/replay/index.ts',
                                                    lineNumber: 1174,
                                                    functionName: 'd',
                                                    columnNumber: 25,
                                                    lineContent:
                                                        '        this.applyScroll(d, false);\n',
                                                    linesBefore:
                                                        '        }\n        if (isSync) {\n          this.treeIndex.scroll(d);\n          break;\n        }\n',
                                                    linesAfter:
                                                        '        break;\n      }\n      case IncrementalSource.ViewportResize:\n        this.emitter.emit(ReplayerEvents.Resize, {\n          width: d.width,\n',
                                                    __typename: 'ErrorTrace',
                                                },
                                                {
                                                    fileName:
                                                        'https://app.highlight.run/static/highlightLib/src/replay/index.ts',
                                                    lineNumber: 657,
                                                    functionName: 'event',
                                                    columnNumber: 32,
                                                    lineContent:
                                                        '          this.applyIncremental(event, isSync);\n',
                                                    linesBefore:
                                                        '          this.iframe.contentWindow!.scrollTo(event.data.initialOffset);\n        };\n        break;\n      case EventType.IncrementalSnapshot:\n        castFn = () =\u003e {\n',
                                                    linesAfter:
                                                        '          if (isSync) {\n            // do not check skip in sync\n            return;\n          }\n          this.handleInactivity(event.timestamp);\n',
                                                    __typename: 'ErrorTrace',
                                                },
                                                {
                                                    fileName:
                                                        'https://app.highlight.run/static/highlightLib/src/replay/index.ts',
                                                    lineNumber: 702,
                                                    functionName: 'castFn',
                                                    columnNumber: 8,
                                                    lineContent:
                                                        '        castFn();\n',
                                                    linesBefore:
                                                        '        break;\n      default:\n    }\n    const wrappedCastFn = () =\u003e {\n      if (castFn) {\n',
                                                    linesAfter:
                                                        '      }\n\n      for (const plugin of this.config.plugins || []) {\n        plugin.handler(event, isSync, { replayer: this });\n      }\n',
                                                    __typename: 'ErrorTrace',
                                                },
                                                {
                                                    fileName:
                                                        'https://app.highlight.run/static/highlightLib/src/replay/machine.ts',
                                                    lineNumber: 207,
                                                    functionName: '',
                                                    columnNumber: 18,
                                                    lineContent:
                                                        '                  castFn();\n',
                                                    linesBefore:
                                                        '              syncEvents.push(event);\n            } else {\n              const castFn = getCastFn(event, false);\n              actions.push({\n                doAction: () =\u003e {\n',
                                                    linesAfter:
                                                        '                },\n                delay: event.delay!,\n              });\n            }\n          }\n',
                                                    __typename: 'ErrorTrace',
                                                },
                                                {
                                                    fileName:
                                                        'https://app.highlight.run/static/highlightLib/src/replay/timer.ts',
                                                    lineNumber: 50,
                                                    functionName: 'doAction',
                                                    columnNumber: 17,
                                                    lineContent:
                                                        '          action.doAction();\n',
                                                    linesBefore:
                                                        '      while (actions.length) {\n        const action = actions[0];\n\n        if (self.timeOffset \u003e= action.delay) {\n          actions.shift();\n',
                                                    linesAfter:
                                                        '        } else {\n          break;\n        }\n      }\n      if (actions.length \u003e 0 || self.liveMode) {\n',
                                                    __typename: 'ErrorTrace',
                                                },
                                            ],
                                            mapped_stack_trace:
                                                '[{"fileName":"https://app.highlight.run/static/highlightLib/src/replay/index.ts","lineNumber":1174,"functionName":"d","columnNumber":25,"error":null,"lineContent":"        this.applyScroll(d, false);\\n","linesBefore":"        }\\n        if (isSync) {\\n          this.treeIndex.scroll(d);\\n          break;\\n        }\\n","linesAfter":"        break;\\n      }\\n      case IncrementalSource.ViewportResize:\\n        this.emitter.emit(ReplayerEvents.Resize, {\\n          width: d.width,\\n"},{"fileName":"https://app.highlight.run/static/highlightLib/src/replay/index.ts","lineNumber":657,"functionName":"event","columnNumber":32,"error":null,"lineContent":"          this.applyIncremental(event, isSync);\\n","linesBefore":"          this.iframe.contentWindow!.scrollTo(event.data.initialOffset);\\n        };\\n        break;\\n      case EventType.IncrementalSnapshot:\\n        castFn = () =\\u003e {\\n","linesAfter":"          if (isSync) {\\n            // do not check skip in sync\\n            return;\\n          }\\n          this.handleInactivity(event.timestamp);\\n"},{"fileName":"https://app.highlight.run/static/highlightLib/src/replay/index.ts","lineNumber":702,"functionName":"castFn","columnNumber":8,"error":null,"lineContent":"        castFn();\\n","linesBefore":"        break;\\n      default:\\n    }\\n    const wrappedCastFn = () =\\u003e {\\n      if (castFn) {\\n","linesAfter":"      }\\n\\n      for (const plugin of this.config.plugins || []) {\\n        plugin.handler(event, isSync, { replayer: this });\\n      }\\n"},{"fileName":"https://app.highlight.run/static/highlightLib/src/replay/machine.ts","lineNumber":207,"functionName":"","columnNumber":18,"error":null,"lineContent":"                  castFn();\\n","linesBefore":"              syncEvents.push(event);\\n            } else {\\n              const castFn = getCastFn(event, false);\\n              actions.push({\\n                doAction: () =\\u003e {\\n","linesAfter":"                },\\n                delay: event.delay!,\\n              });\\n            }\\n          }\\n"},{"fileName":"https://app.highlight.run/static/highlightLib/src/replay/timer.ts","lineNumber":50,"functionName":"doAction","columnNumber":17,"error":null,"lineContent":"          action.doAction();\\n","linesBefore":"      while (actions.length) {\\n        const action = actions[0];\\n\\n        if (self.timeOffset \\u003e= action.delay) {\\n          actions.shift();\\n","linesAfter":"        } else {\\n          break;\\n        }\\n      }\\n      if (actions.length \\u003e 0 || self.liveMode) {\\n"}]',
                                            stack_trace:
                                                '[{"functionName":null,"args":null,"fileName":"https://app.highlight.run/static/js/3.5b104b7d.chunk.js","lineNumber":2,"columnNumber":601253,"isEval":null,"isNative":null,"source":"https://app.highlight.run/static/js/3.5b104b7d.chunk.js:2:601253"},{"functionName":"n","args":null,"fileName":"https://app.highlight.run/static/js/3.5b104b7d.chunk.js","lineNumber":2,"columnNumber":591089,"isEval":null,"isNative":null,"source":"n@https://app.highlight.run/static/js/3.5b104b7d.chunk.js:2:591089"},{"functionName":null,"args":null,"fileName":"https://app.highlight.run/static/js/3.5b104b7d.chunk.js","lineNumber":2,"columnNumber":591880,"isEval":null,"isNative":null,"source":"https://app.highlight.run/static/js/3.5b104b7d.chunk.js:2:591880"},{"functionName":"doAction","args":null,"fileName":"https://app.highlight.run/static/js/3.5b104b7d.chunk.js","lineNumber":2,"columnNumber":616078,"isEval":null,"isNative":null,"source":"doAction@https://app.highlight.run/static/js/3.5b104b7d.chunk.js:2:616078"},{"functionName":"r","args":null,"fileName":"https://app.highlight.run/static/js/3.5b104b7d.chunk.js","lineNumber":2,"columnNumber":622684,"isEval":null,"isNative":null,"source":"r@https://app.highlight.run/static/js/3.5b104b7d.chunk.js:2:622684"}]',
                                            metadata_log: [
                                                {
                                                    error_id: 9836524,
                                                    session_secure_id:
                                                        'xvUHChiKRu4psJlngdcKxmOcK1xR',
                                                    environment: null,
                                                    timestamp:
                                                        '2022-02-08T21:07:21.856Z',
                                                    os: 'Mac OS X',
                                                    browser: 'Safari',
                                                    visited_url:
                                                        'https://app.highlight.run/396/sessions/BqSoLoJ1nV2XpgGOXw0SlGncuzyM',
                                                    fingerprint: '3151784812',
                                                    identifier:
                                                        'amado@citybldr.com',
                                                    user_properties:
                                                        '{"avatar":"https://lh3.googleusercontent.com/a-/AOh14Gjr3v8hkOXCGiZuOZUvEL6VdcGZFVlkGqjBiNJE=s96-c","id":"1387","name":"Amado Tanglao-Namiki"}',
                                                    request_id: null,
                                                    __typename: 'ErrorMetadata',
                                                },
                                                {
                                                    error_id: 9827036,
                                                    session_secure_id:
                                                        'dZdlMXvSiHxNycgI1rUdCKTyoskd',
                                                    environment: null,
                                                    timestamp:
                                                        '2022-02-08T16:51:46.767Z',
                                                    os: 'Mac OS X',
                                                    browser: 'Safari',
                                                    visited_url:
                                                        'https://app.highlight.run/220/sessions/3X4gv8AXyOtP0fAdov0LfFbNXPwg?query=and%7C%7Cuser_email%2Cis%2Cpraty%40dashworks.ai%7C%7Ctrack_event%2Cis%2Cdash-search-query',
                                                    fingerprint: '3177677162',
                                                    identifier:
                                                        'developers@dashworks.ai',
                                                    user_properties:
                                                        '{"avatar":"https://lh3.googleusercontent.com/a/AATXAJyosVwynSe0VH79USRcxXpu_k-Mt7ra6_tPMlCr=s96-c","id":"2690","name":"Developers Dashworks"}',
                                                    request_id: null,
                                                    __typename: 'ErrorMetadata',
                                                },
                                                {
                                                    error_id: 9830283,
                                                    session_secure_id:
                                                        '9KKHAg0eLCpi4S0fl5qJ4pvMdu9K',
                                                    environment: null,
                                                    timestamp:
                                                        '2022-02-08T18:12:42.285Z',
                                                    os: 'Mac OS X',
                                                    browser: 'Safari',
                                                    visited_url:
                                                        'https://app.highlight.run/396/sessions/7xrrIsk8MJ9iNZDP8KMsemLqjbB9?query=and%7C%7Ccustom_processed%2Cis%2Ctrue%7C%7Csession_visited-url%2Ccontains%2Ctitle',
                                                    fingerprint: '4087218336',
                                                    identifier:
                                                        'amado@citybldr.com',
                                                    user_properties:
                                                        '{"avatar":"https://lh3.googleusercontent.com/a-/AOh14Gjr3v8hkOXCGiZuOZUvEL6VdcGZFVlkGqjBiNJE=s96-c","id":"1387","name":"Amado Tanglao-Namiki"}',
                                                    request_id: null,
                                                    __typename: 'ErrorMetadata',
                                                },
                                                {
                                                    error_id: 9831159,
                                                    session_secure_id:
                                                        '1qQW5RsKIyuSSmlyU0vJQrc5V0i4',
                                                    environment: null,
                                                    timestamp:
                                                        '2022-02-08T18:47:24.659Z',
                                                    os: 'Mac OS X',
                                                    browser: 'Safari',
                                                    visited_url:
                                                        'https://app.highlight.run/396/errors',
                                                    fingerprint: '3151784812',
                                                    identifier:
                                                        'amado@citybldr.com',
                                                    user_properties:
                                                        '{"avatar":"https://lh3.googleusercontent.com/a-/AOh14Gjr3v8hkOXCGiZuOZUvEL6VdcGZFVlkGqjBiNJE=s96-c","id":"1387","name":"Amado Tanglao-Namiki"}',
                                                    request_id: null,
                                                    __typename: 'ErrorMetadata',
                                                },
                                                {
                                                    error_id: 9829136,
                                                    session_secure_id:
                                                        'cohMoERS07yXEhM4N01U2iDcka0W',
                                                    environment: null,
                                                    timestamp:
                                                        '2022-02-08T17:42:43.261Z',
                                                    os: 'Mac OS X',
                                                    browser: 'Safari',
                                                    visited_url:
                                                        'https://app.highlight.run/674/sessions/9f0E1Fy1bzpzTAJDGGjxaS0TnVYA?query=and%7C%7Ccustom_processed%2Cis%2Ctrue',
                                                    fingerprint: '3151784812',
                                                    identifier:
                                                        'amado@citybldr.com',
                                                    user_properties:
                                                        '{"avatar":"https://lh3.googleusercontent.com/a-/AOh14Gjr3v8hkOXCGiZuOZUvEL6VdcGZFVlkGqjBiNJE=s96-c","id":"1387","name":"Amado Tanglao-Namiki"}',
                                                    request_id: null,
                                                    __typename: 'ErrorMetadata',
                                                },
                                                {
                                                    error_id: 9825923,
                                                    session_secure_id:
                                                        'Wu14F8Q1SLi0k781GpMejJ83oxyr',
                                                    environment: null,
                                                    timestamp:
                                                        '2022-02-08T16:08:45.59Z',
                                                    os: 'Mac OS X',
                                                    browser: 'Safari',
                                                    visited_url:
                                                        'https://app.highlight.run/220/sessions/TjostUO8PQUIW1n7tf0Zlttlxl5f',
                                                    fingerprint: '2591796716',
                                                    identifier:
                                                        'developers@dashworks.ai',
                                                    user_properties:
                                                        '{"avatar":"https://lh3.googleusercontent.com/a/AATXAJyosVwynSe0VH79USRcxXpu_k-Mt7ra6_tPMlCr=s96-c","id":"2690","name":"Developers Dashworks"}',
                                                    request_id: null,
                                                    __typename: 'ErrorMetadata',
                                                },
                                                {
                                                    error_id: 9663135,
                                                    session_secure_id:
                                                        'dgBDIjQcoDsmNWYzk8w09OhqVBJk',
                                                    environment: null,
                                                    timestamp:
                                                        '2022-02-05T08:40:52.384Z',
                                                    os: 'Mac OS X',
                                                    browser: 'Safari',
                                                    visited_url:
                                                        'https://app.highlight.run/220/sessions/wzIOU9RvWrjbr3NELhiWJEddzZB0',
                                                    fingerprint: '3121589846',
                                                    identifier:
                                                        'developers@dashworks.ai',
                                                    user_properties:
                                                        '{"avatar":"https://lh3.googleusercontent.com/a/AATXAJyosVwynSe0VH79USRcxXpu_k-Mt7ra6_tPMlCr=s96-c","id":"2690","name":"Developers Dashworks"}',
                                                    request_id: null,
                                                    __typename: 'ErrorMetadata',
                                                },
                                            ],
                                            fields: [
                                                {
                                                    name: 'os_name',
                                                    value: 'Mac OS X',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'browser',
                                                    value: 'Safari',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/155/errors/wEkdp0tG2kTaksXgd0896Ob42Syn',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/fgCp5kEHtLPxu1GXY9MGIunz7l1K',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/wzIOU9RvWrjbr3NELhiWJEddzZB0',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'event',
                                                    value:
                                                        '["\\"TypeError: null is not an object (evaluating \'n.defaultView.scrollTo\')\\""]',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/pQmvO6tfM1M3lh2uofM1KYcW3IA1',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/9kKc4RjYldUMnxBRFLXuK54B2ZgU',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/GybE7M1IGD13qOWa0R9jfZpA0I7M',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/OSXPph4yC0bDeNGOvGXK210E3TTo',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/ruKdgeqNvrC04SJHp8xkOUmjG0Fq',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/87KeUTQ2obWpqm16nRZIvZqfpAcu',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/g8dgkmeRWHnGeGgvZAqDXat8YDBs',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/PQWCazCdYVPZW3QnEjsCG1t7fYgv',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/8DocDsIpWEPnh3IldZN1p7zla0OJ',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/E4MIyVNlnf6MWqw4bQHxccG7S73r',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/TjostUO8PQUIW1n7tf0Zlttlxl5f',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/220/sessions/3X4gv8AXyOtP0fAdov0LfFbNXPwg?query=and%7C%7Cuser_email%2Cis%2Cpraty%40dashworks.ai%7C%7Ctrack_event%2Cis%2Cdash-search-query',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/674/sessions/9f0E1Fy1bzpzTAJDGGjxaS0TnVYA?query=and%7C%7Ccustom_processed%2Cis%2Ctrue',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/674/sessions/7OrVmHrD1PRi8B0ZdOW92092b3sZ?query=and%7C%7Ccustom_processed%2Cis%2Ctrue',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/396/sessions/7xrrIsk8MJ9iNZDP8KMsemLqjbB9?query=and%7C%7Ccustom_processed%2Cis%2Ctrue%7C%7Csession_visited-url%2Ccontains%2Ctitle',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/396/sessions/Q1w7w1UJloDqj08hCE0SHni1knxI',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/396/sessions/AV01m0LiFLDs5SLgYrmoNWxRfzUg',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/396/sessions/fqlNIeH5AVeudBmbrLqzeGC3ilAq',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/396/sessions/QxuN5smxPhwrTJI6cb4GPtzAJgZM',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/396/errors',
                                                    __typename: 'ErrorField',
                                                },
                                                {
                                                    name: 'visited_url',
                                                    value:
                                                        'https://app.highlight.run/396/sessions/BqSoLoJ1nV2XpgGOXw0SlGncuzyM',
                                                    __typename: 'ErrorField',
                                                },
                                            ],
                                            error_frequency: [
                                                0,
                                                0,
                                                13,
                                                1,
                                                0,
                                                12,
                                            ],
                                            is_public: false,
                                            __typename: 'ErrorGroup',
                                        } as any
                                    }
                                />
                            </div>
                            {loading && (
                                <h3>
                                    <Skeleton
                                        duration={1}
                                        count={1}
                                        style={{ width: 300 }}
                                    />
                                </h3>
                            )}
                            {!loading && data?.error_group?.project_id && (
                                <div className={styles.fieldWrapper}>
                                    <ErrorFrequencyGraph
                                        errorGroup={data?.error_group}
                                    />
                                </div>
                            )}
                        </div>
                        <div
                            className={classNames(styles.errorPageRightColumn, {
                                [styles.bannerShown]: showBanner,
                            })}
                            ref={newCommentModalRef}
                        >
                            <ErrorAffectedUsers
                                errorGroup={data}
                                loading={loading}
                            />
                            <ErrorRightPanel
                                errorGroup={data}
                                parentRef={newCommentModalRef}
                            />
                        </div>
                    </>
                ) : errorQueryingErrorGroup ? (
                    <ErrorState
                        shownWithHeader
                        message="This error does not exist or has not been made public."
                    />
                ) : (
                    <NoActiveErrorCard />
                )}
            </div>
        </ErrorSearchContextProvider>
    );
};

type FrequencyGraphProps = {
    errorGroup?: Maybe<Pick<ErrorGroup, 'secure_id' | 'project_id'>>;
};

type ErrorFrequency = {
    date: string;
    occurrences: number;
};

const LookbackPeriod = 60;

const timeFilter = [
    { label: 'Last 24 hours', value: 2 },
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'This year', value: 30 * 12 },
] as const;

export const ErrorFrequencyGraph: React.FC<FrequencyGraphProps> = ({
    errorGroup,
}) => {
    const [errorDates, setErrorDates] = useState<Array<ErrorFrequency>>(
        Array(LookbackPeriod).fill(0)
    );
    const [totalErrors, setTotalErrors] = useState<number>(0);
    const [dateRangeLength, setDateRangeLength] = useState<number>(
        timeFilter[1].value
    );

    useEffect(() => {
        setErrorDates(Array(dateRangeLength).fill(0));
    }, [dateRangeLength]);

    useGetDailyErrorFrequencyQuery({
        variables: {
            project_id: `${errorGroup?.project_id}`,
            error_group_secure_id: `${errorGroup?.secure_id}`,
            date_offset: dateRangeLength - 1,
        },
        skip: !errorGroup,
        onCompleted: (response) => {
            const errorData = response.dailyErrorFrequency.map((val, idx) => ({
                date: moment()
                    .startOf('day')
                    .subtract(dateRangeLength - 1 - idx, 'days')
                    .format('D MMM YYYY'),
                occurrences: val,
            }));
            setTotalErrors(
                response.dailyErrorFrequency.reduce((acc, val) => acc + val, 0)
            );
            setErrorDates(errorData);
        },
    });

    return (
        <>
            <div
                className={classNames(
                    styles.titleWithAction,
                    styles.titleWithMargin
                )}
            >
                <h3>Error Frequency</h3>
                <StandardDropdown
                    data={timeFilter}
                    defaultValue={timeFilter[1]}
                    onSelect={setDateRangeLength}
                    disabled={!errorGroup}
                />
            </div>
            <div className={classNames(styles.section, styles.graphSection)}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        width={500}
                        height={300}
                        data={errorDates}
                        margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid stroke={'#D9D9D9'} vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={false}
                            axisLine={{ stroke: '#D9D9D9' }}
                        />
                        <YAxis
                            tickCount={10}
                            interval="preserveStart"
                            allowDecimals={false}
                            hide={true}
                        />
                        <RechartsTooltip content={<RechartTooltip />} />
                        <Bar dataKey="occurrences" radius={[2, 2, 0, 0]}>
                            {errorDates.map((e, i) => (
                                <Cell
                                    key={i}
                                    fill={
                                        e.occurrences >
                                        Math.max(totalErrors * 0.1, 10)
                                            ? 'var(--color-red-500)'
                                            : 'var(--color-brown)'
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className={styles.graphLabels}>
                    <div>{`Total Occurrences: ${totalErrors}`}</div>
                </div>
            </div>
        </>
    );
};

export const getHeaderFromError = (
    errorMsg: Maybe<string>[] | undefined
): string => {
    const eventText = parseErrorDescriptionList(errorMsg)[0];
    let title = '';
    // Try to get the text in the form Text: ....
    const splitOnColon = eventText?.split(':') ?? [];
    if (
        splitOnColon.length &&
        (!splitOnColon[0].includes(' ') ||
            splitOnColon[0].toLowerCase().includes('error'))
    ) {
        return splitOnColon[0];
    }
    // Try to get text in the form "'Something' Error" in the event.
    const split = eventText?.split(' ') ?? [];
    let prev = '';
    for (let i = 0; i < split?.length; i++) {
        const curr = split[i];
        if (curr.toLowerCase().includes('error')) {
            title = (prev ? prev + ' ' : '') + curr;
            return title;
        }
        prev = curr;
    }

    return errorMsg?.join() ?? '';
};

export default ErrorPage;
