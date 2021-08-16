export interface SessionDetails {
    /** The URL to view the session. */
    url: string;
    /** The URL to view the session at the time getSessionDetails was called during the session recording. */
    urlWithTimestamp: string;
}

export type Integration = (integrationOptions?: any) => void;
