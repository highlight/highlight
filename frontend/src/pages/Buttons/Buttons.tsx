import React, { useState } from 'react';

import { useSendEmailSignupMutation } from '../../graph/generated/hooks';
import styles from './Buttons.module.scss';
export const Buttons = () => {
    const [hasError, setHasError] = useState(false);
    const [sendEmail, { loading }] = useSendEmailSignupMutation();
    if (hasError) {
        throw new Error('got an error');
    }
    const [showBadComponent, setShowBadComponent] = useState(false);

    return (
        <div className={styles.buttonBody}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: '32px',
                    position: 'absolute',
                    left: '35%',
                    top: '35%',
                    alignItems: 'center',
                }}
            >
                <h2>Welcome back Elon, ready for launch?</h2>
                <img
                    src="https://media3.giphy.com/media/3ohs4rclkSSrNGSlFK/giphy.gif?cid=ecf05e4701zhvrmxwedxbr33ns5bcpzijhf74v5yeqzqryt6&rid=giphy.gif&ct=g"
                    alt=""
                />
                <div className={styles.container}>
                    <article
                        onClick={() => {
                            setShowBadComponent(true);
                        }}
                    >
                        <span>Launch Falcon</span>
                    </article>
                </div>
                {showBadComponent && <BadComponent />}
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
