import { H } from 'highlight.run';
import React from 'react';

import commonStyles from '../../Common.module.scss';
import styles from './Buttons.module.scss';
import { CustomError, DefaultError } from './ButtonsHelper';
export const Buttons = () => {
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
        </div>
    );
};
