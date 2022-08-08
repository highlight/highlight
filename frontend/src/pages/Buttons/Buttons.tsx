import {
    useGetCommentTagsForProjectQuery,
    useGetWorkspaceAdminsByProjectIdLazyQuery,
    useSendEmailSignupMutation,
} from '@graph/hooks';
import { SampleBuggyButton } from '@highlight-run/react';
import DO_NOT_USE_Canvas from '@pages/Buttons/Canvas';
import { H } from 'highlight.run';
import React, { useState } from 'react';

import commonStyles from '../../Common.module.scss';
import styles from './Buttons.module.scss';
import {
    CustomError,
    DefaultError,
    NestedError,
    RandomError,
} from './ButtonsHelper';

export const Buttons = () => {
    const [hasError, setHasError] = useState(false);
    const [sendEmail, { loading }] = useSendEmailSignupMutation();
    if (hasError) {
        throw new Error('got an error');
    }
    const [getWorkspaceAdmins] = useGetWorkspaceAdminsByProjectIdLazyQuery({
        variables: { project_id: '1' },
        fetchPolicy: 'network-only',
    });
    const [showBadComponent, setShowBadComponent] = useState(false);
    const {} = useGetCommentTagsForProjectQuery({
        variables: { project_id: '1' },
    });

    return (
        <div className={styles.container}>
            <div className={styles.buttonBody}>
                <i className="mdi mdi-progress-check mdi-48px"></i>
                <iframe
                    title="Introducing Superhuman"
                    src="https://www.youtube.com/embed/JMsFfX6qTNI?rel=0"
                ></iframe>
                <div className={'highlight-mask'}>
                    This is masked.{' '}
                    <img src={'/images/logo.png'} height={16} alt={'masked'} />
                </div>
                <div className={'highlight-block'}>
                    This is blocked.{' '}
                    <img src={'/images/logo.png'} height={16} alt={'blocked'} />
                </div>
                <div className={'highlight-ignore'}>
                    This is ignored.{' '}
                    <img src={'/images/logo.png'} height={16} alt={'ignored'} />
                </div>
            </div>
            <div className={styles.buttonBody}>
                <div>
                    <button
                        onClick={() => {
                            setShowBadComponent(true);
                        }}
                    >
                        Show Error Boundary
                    </button>
                    {showBadComponent && <BadComponent />}
                </div>
                <DO_NOT_USE_Canvas />
                <div>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            sendEmail({
                                variables: {
                                    email: 'anothernewemail@newemail.com',
                                },
                            });
                        }}
                    >
                        {loading ? 'loading...' : 'Send an email'}
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            DefaultError();
                        }}
                    >
                        Throw an Error
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            RandomError();
                        }}
                    >
                        Throw a randomized Error
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            NestedError('outer error');
                        }}
                    >
                        Throw a nested Error
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            NestedError('outer error 2');
                        }}
                    >
                        Throw a different nested error
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            console.error('boba');
                        }}
                    >
                        Console Error
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            setHasError(true);
                        }}
                    >
                        H.consumeError()
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            H.error('Highlight H.error');
                        }}
                    >
                        H.error()
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            CustomError();
                        }}
                    >
                        Throw a custom Error
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            H.stop();
                        }}
                    >
                        Stop Recording
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            H.track(
                                'therewasonceahumblebumblebeeflyingthroughtheforestwhensuddenlyadropofwaterfullyencasedhimittookhimasecondtofigureoutthathesinaraindropsuddenlytheraindrophitthegroundasifhewasdivingintoapoolandheflewawaywithnofurtherissues'
                            );
                        }}
                    >
                        Track
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            H.toggleSessionFeedbackModal();
                        }}
                    >
                        toggleSessionFeedbackModal
                    </button>
                    <SampleBuggyButton />
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            H.track('thisIsLong', {
                                longProperty:
                                    'This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. ',
                            });
                        }}
                    >
                        Really long track property
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            const controller = new AbortController();
                            setTimeout(() => controller.abort(), 1000);

                            fetch(
                                'https://javascript.info/article/fetch-abort/demo/hang',
                                {
                                    signal: controller.signal,
                                }
                            ).catch(() => {
                                console.log('abort caught!');
                            });
                        }}
                    >
                        Abort!
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            H.track('thisIsInvalid', {
                                // @ts-expect-error
                                invalidProperty: { nestedProperty: true },
                            });
                        }}
                    >
                        Invalid type track property
                    </button>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            getWorkspaceAdmins();
                        }}
                    >
                        Private Graph Request
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => {
                            fetch('https://pokeapi.co/api/v2/pokemon/ditto', {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            });
                        }}
                    >
                        GET fetch('https://pokeapi.co/api/v2/pokemon/ditto')
                    </button>
                    <button
                        onClick={() => {
                            fetch('https://pokeapi.co/api/v2/pokemon/ditto', {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization:
                                        'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
                                    Cookie:
                                        'PHPSESSID=298zf09hf012fh2; csrftoken=u32t4o3tb3gg43; _gat=1',
                                    'Proxy-Authorization':
                                        'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
                                },
                            });
                        }}
                    >
                        GET fetch('https://pokeapi.co/api/v2/pokemon/ditto')
                        with sensitive headers
                    </button>
                    <button
                        onClick={() => {
                            fetch('https://pokeapi.co/api/v2/pokemon/ditto', {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                method: 'POST',
                                body: '{"code":"SDFSDF"}',
                            });
                        }}
                    >
                        POST fetch('https://pokeapi.co/api/v2/pokemon/ditto')
                    </button>
                    <button
                        onClick={() => {
                            const http = new XMLHttpRequest();
                            const url =
                                'https://pokeapi.co/api/v2/pokemon/ditto';
                            const params = '{"code":"SDFSDF"}';
                            http.open('POST', url, true);

                            //Send the proper header information along with the request
                            http.setRequestHeader(
                                'Content-type',
                                'application/json'
                            );

                            http.onreadystatechange = function () {
                                //Call a function when the state changes.
                                if (
                                    http.readyState == 4 &&
                                    http.status == 200
                                ) {
                                    alert(http.responseText);
                                }
                            };
                            http.send(params);
                        }}
                    >
                        POST xhr('https://pokeapi.co/api/v2/pokemon/ditto')
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => {
                            const methods = [
                                'assert',
                                'count',
                                'countReset',
                                'debug',
                                'dir',
                                'dirxml',
                                'error',
                                'group',
                                'groupCollapsed',
                                'groupEnd',
                                'info',
                                'log',
                                'table',
                                'time',
                                'timeEnd',
                                'timeLog',
                                'trace',
                                'warn',
                            ];

                            methods.forEach((method) => {
                                // @ts-expect-error
                                console[method]('HELLO WORLD');
                            });
                        }}
                    >
                        Console Log
                    </button>
                </div>
            </div>
        </div>
    );
};

const BadComponent = () => (
    <div>
        {/* @ts-expect-error */}
        {badVariableAccess}
    </div>
);

export default Buttons;
