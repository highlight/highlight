import { ButtonProps, message } from 'antd';
import React, { useContext } from 'react';
import Button from '../../../components/Button/Button/Button';
import ReplayerContext from '../ReplayerContext';
import { onGetLinkWithTimestamp } from './utils/utils';

const ShareButton = (props: ButtonProps) => {
    const { time } = useContext(ReplayerContext);

    const onClickHandler = () => {
        const url = onGetLinkWithTimestamp(time);
        message.success('Copied link!');
        navigator.clipboard.writeText(url.href);
    };

    return (
        <Button type="primary" onClick={onClickHandler} {...props}>
            Share
        </Button>
    );
};

export default ShareButton;
