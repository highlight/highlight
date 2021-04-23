import { message } from 'antd';
import React, { useContext } from 'react';
import Button from '../../../components/Button/Button/Button';
import ReplayerContext from '../ReplayerContext';
import styles from './ShareButton.module.scss';
import { onGetLinkWithTimestamp } from './utils/utils';

const ShareButton = () => {
    const { time } = useContext(ReplayerContext);

    const onClickHandler = () => {
        const url = onGetLinkWithTimestamp(time);
        message.success('Copied link!');
        navigator.clipboard.writeText(url.href);
    };

    return (
        <Button onClick={onClickHandler} className={styles.shareButton}>
            Share
        </Button>
    );
};

export default ShareButton;
