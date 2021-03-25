import React from 'react';
import styles from './Buttons.module.scss';
import commonStyles from '../../Common.module.scss';
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
            </div>
        </div>
    );
};
