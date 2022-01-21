import DO_NOT_USE_Canvas from '@pages/Buttons/Canvas';
import { H } from 'highlight.run';
import React, { useState } from 'react';

import commonStyles from '../../Common.module.scss';
import {
    useGetCommentTagsForProjectQuery,
    useGetWorkspaceAdminsByProjectIdLazyQuery,
    useSendEmailSignupMutation,
} from '../../graph/generated/hooks';
import styles from './Buttons.module.scss';
import { CustomError, DefaultError } from './ButtonsHelper';
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
        <div className={styles.buttonBody}>
            <iframe
                title="Introducing Superhuman"
                src="https://www.youtube.com/embed/JMsFfX6qTNI?rel=0"
            ></iframe>
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
                                Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
                                Cookie:
                                    'PHPSESSID=298zf09hf012fh2; csrftoken=u32t4o3tb3gg43; _gat=1',
                                'Proxy-Authorization':
                                    'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
                            },
                        });
                    }}
                >
                    GET fetch('https://pokeapi.co/api/v2/pokemon/ditto') with
                    sensitive headers
                </button>
                <button
                    onClick={() => {
                        fetch('https://pokeapi.co/api/v2/pokemon/ditto', {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            method: 'POST',
                        });
                    }}
                >
                    POST fetch('https://pokeapi.co/api/v2/pokemon/ditto')
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
    );
};

const BadComponent = () => (
    <div>
        {/* @ts-expect-error */}
        {badVariableAccess}
    </div>
);

export default Buttons;
