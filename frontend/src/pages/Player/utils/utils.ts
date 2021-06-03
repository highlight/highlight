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
    /** Automatically sets the referrer for the current segment based on the value. */
    referrer = 'referrer',
    /** Automatically sets the date range for the current segment based on the value. */
    date = 'date',
    /** Automatically sets the identifier for the current segment based on the value. */
    identifier = 'identifier',
    /** Automatically sets the field id and identifier for the current segment based on the value. */
    identifierAndId = 'identifierAndId',
    /** Automatically sets the first time users for the current segment to true. */
    firstTimeUsers = 'firstTimeUsers',
    /** Automatically sets the device id for the current segment based on the value. */
    deviceId = 'deviceId',
}
