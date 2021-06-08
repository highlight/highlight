import { message } from 'antd';
import React from 'react';

import SvgCopyIcon from '../../static/CopyIcon';
import Button from '../Button/Button/Button';
import styles from './CopyText.module.scss';

interface Props {
    text: string;
}

const CopyText: React.FC<Props> = ({ text }) => {
    return (
        <div className={styles.container}>
            <span className={styles.link}>{text}</span>
            <Button
                type="text"
                trackingId="CopyText"
                className={styles.icon}
                onClick={() => {
                    navigator.clipboard.writeText(text);
                    message.success('Copied the invite link');
                }}
                iconButton
            >
                <SvgCopyIcon />
            </Button>
        </div>
    );
};

export default CopyText;
