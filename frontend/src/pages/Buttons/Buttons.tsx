import { H } from 'highlight.run';
import React, { useState } from 'react';

import commonStyles from '../../Common.module.scss';
import { useSendEmailSignupMutation } from '../../graph/generated/hooks';
import styles from './Buttons.module.scss';
import { CustomError, DefaultError } from './ButtonsHelper';
export const Buttons = () => {
    const [hasError, setHasError] = useState(false);
    const [sendEmail, { loading }] = useSendEmailSignupMutation();
    const [showTest, setShowTest] = useState(false);

    if (hasError) {
        throw new Error('got an error');
    }
    return (
        <div className={styles.buttonBody}>
            <div>
                <button
                    onClick={() => {
                        setShowTest(true);
                    }}
                >
                    Show Error Boundary
                </button>
                {showTest && <Test21 />}

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
        </div>
    );
};

const Test21 = () => (
    <h2>
        {/* @ts-expect-error*/}
        {badVariable}
    </h2>
);
