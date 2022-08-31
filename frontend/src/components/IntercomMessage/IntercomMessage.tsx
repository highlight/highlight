import Button from '@components/Button/Button/Button';
import React from 'react';

import styles from './IntercomMessage.module.scss';

interface Props {
    defaultMessage?: string;
}

export const IntercomInlineMessage: React.FC<
    React.PropsWithChildren<React.PropsWithChildren<Props>>
> = ({ children, defaultMessage }) => {
    return (
        <Button
            trackingId="IntercomInlineMessage"
            onClick={() => window.Intercom('showNewMessage', defaultMessage)}
            type="text"
            className={styles.inline}
        >
            {children}
        </Button>
    );
};
