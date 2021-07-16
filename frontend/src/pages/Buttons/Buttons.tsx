import { H } from 'highlight.run';
import React, { useState } from 'react';

import commonStyles from '../../Common.module.scss';
import styles from './Buttons.module.scss';
import { CustomError, DefaultError } from './ButtonsHelper';
export const Buttons = () => {
    const [hasError, setHasError] = useState(false);
    if (hasError) {
        throw new Error('got an error');
    }
    return (
        <div className={styles.buttonBody}>
            <div>
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
