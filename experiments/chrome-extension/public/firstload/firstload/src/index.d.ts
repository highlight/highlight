import { DebugOptions } from '../../client/src/index';
import { SessionDetails } from './types/types';
export declare type HighlightOptions = {
    debug?: boolean | DebugOptions;
    scriptUrl?: string;
    backendUrl?: string;
    manualStart?: boolean;
    disableNetworkRecording?: boolean;
    disableConsoleRecording?: boolean;
    enableSegmentIntegration?: boolean;
    environment?: 'development' | 'staging' | 'production' | string;
    /**
     * Enabling this will disable recording of text data on the page. This is useful if you do not want to record personally identifiable information and don't want to manually annotate your code with the class name "highlight-block".
     * @example
     * // Text will be randomized. Instead of seeing "Hello World" in a recording, you will see "1fds1 j59a0".
     * @see {@link https://docs.highlight.run/docs/privacy} for more information.
     */
    enableStrictPrivacy?: boolean;
};
declare type HighlightPublicInterface = {
    init: (orgID: number | string, debug?: HighlightOptions) => void;
    identify: (identify: string, obj: any) => void;
    track: (event: string, obj: any) => void;
    error: (message: string, payload?: {
        [key: string]: string;
    }) => void;
    getSessionURL: () => Promise<string>;
    getSessionDetails: () => Promise<SessionDetails>;
    start: () => void;
    /** Stops the session and error recording. */
    stop: () => void;
    onHighlightReady: (func: () => void) => void;
    options: HighlightOptions | undefined;
};
export declare const H: HighlightPublicInterface;
export {};
