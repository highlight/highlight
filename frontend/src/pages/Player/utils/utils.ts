import { message } from 'antd';
import { PlayerSearchParameters } from '../PlayerHook/utils';

/**
 * Copies a URL to the current time in the session to the user's clipboard.
 */
const copySessionShareLinkToClipboard = (time: number) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set(
        PlayerSearchParameters.ts,
        (time / 1000).toString()
    );

    message.success('Copied link!');
    navigator.clipboard.writeText(currentUrl.href);
};

export default copySessionShareLinkToClipboard;
