import React, { useContext } from 'react';
import PrimaryButton from '../../../components/Button/PrimaryButton/PrimaryButton';
import ReplayerContext from '../ReplayerContext';
import { message } from 'antd';

const ShareButton = () => {
    const { time } = useContext(ReplayerContext);

    /**
     * Copies the current session URL with a search parameter "ts" with the player's current time in minutes.
     */
    const onGetLinkWithTimestamp = () => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('ts', (time / (1000 * 60)).toString());

        message.success('Copied link!');
        navigator.clipboard.writeText(currentUrl.href);
    };
    return (
        <PrimaryButton onClick={onGetLinkWithTimestamp}>Share</PrimaryButton>
    );
};

export default ShareButton;
