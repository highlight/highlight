import { ButtonProps, message } from 'antd';
import React from 'react';

import Button from '../../../components/Button/Button/Button';
import { useReplayerContext } from '../ReplayerContext';
import { onGetLinkWithTimestamp } from './utils/utils';

const ShareButton = (props: ButtonProps) => {
    const { time } = useReplayerContext();

    const onClickHandler = () => {
        const url = onGetLinkWithTimestamp(time);
        message.success('Copied link!');
        navigator.clipboard.writeText(url.href);
    };

    return (
        <Button
            type="primary"
            onClick={onClickHandler}
            {...props}
            trackingId="ShareSession"
        >
            Share
        </Button>
    );
};

export default ShareButton;
