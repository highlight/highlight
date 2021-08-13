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

/**
 * Search params for the Session page.
 */
export enum SessionPageSearchParams {
    /** Automatically sets the date range for the current segment based on the value. */
    date = 'date',
}
