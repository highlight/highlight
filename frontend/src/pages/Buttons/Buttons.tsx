import { H } from 'highlight.run';
import React from 'react';

import commonStyles from '../../Common.module.scss';
import styles from './Buttons.module.scss';
export const Buttons = () => {
    return (
        <div className={styles.buttonBody}>
            <div>
                <button
                    className={commonStyles.submitButton}
                    onClick={() => {
                        throw new Error('errors page');
                    }}
                >
                    Throw an Error
                </button>
                <button
                    className={commonStyles.submitButton}
                    onClick={() => {
                        H.error('error is being thrown yo!');
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
