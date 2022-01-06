import SvgCopyIcon from '@icons/CopyIcon';
import { message } from 'antd';
import classNames from 'classnames';
import React from 'react';

import Button from '../Button/Button/Button';
import styles from './CopyText.module.scss';

interface Props {
    text: string;
    className?: string;
    inline?: boolean;
}

const CopyText: React.FC<Props> = ({ text, className, inline }) => {
    const onCopyHandler = () => {
        navigator.clipboard.writeText(text);
        message.success('Copied the invite link');
    };

    if (inline) {
        return (
            <div className={styles.inlineContainer}>
                <span>{text}</span>
                <Button
                    trackingId="CopyTextMinimal"
                    iconButton
                    type="text"
                    className={styles.copyButton}
                    onClick={onCopyHandler}
                >
                    <SvgCopyIcon />
                </Button>
            </div>
        );
    }

    return (
        <div className={classNames(className, styles.container)}>
            <span className={styles.link}>{text}</span>
            <Button
                type="primary"
                trackingId="CopyText"
                className={styles.copyButton}
                onClick={onCopyHandler}
            >
                Copy
            </Button>
        </div>
    );
};

export default CopyText;
