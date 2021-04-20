import { message } from 'antd';
import React, { useContext } from 'react';
import PrimaryButton from '../../../components/Button/PrimaryButton/PrimaryButton';
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
        <PrimaryButton onClick={onClickHandler} className={styles.shareButton}>
            Share
        </PrimaryButton>
    );
};

export default ShareButton;
