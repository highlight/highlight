import { message } from 'antd';
import classNames from 'classnames';
import React from 'react';

import Button from '../Button/Button/Button';
import styles from './CopyText.module.scss';

interface Props {
    text: string;
    className?: string;
}

const CopyText: React.FC<Props> = ({ text, className }) => {
    return (
        <div className={classNames(className, styles.container)}>
            <span className={styles.link}>{text}</span>
            <Button
                type="primary"
                trackingId="CopyText"
                className={styles.copyButton}
                onClick={() => {
                    navigator.clipboard.writeText(text);
                    message.success('Copied the invite link');
                }}
            >
                Copy
            </Button>
        </div>
    );
};

export default CopyText;
