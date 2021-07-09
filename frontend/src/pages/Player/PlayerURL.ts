import { PlayerSearchParameters } from './PlayerHook/utils';

export class PlayerURL extends URL {
    constructor(urlString: string) {
        super(urlString);
    }

    // TODO: Do I need to clear the params?
    static currentURL(): PlayerURL {
        return new PlayerURL(window.location.href);
    }

    setTimestamp(time: number): PlayerURL {
        this.searchParams.set(
            PlayerSearchParameters.ts,
            (time / 1000).toString()
        );
        return this;
    }

    setShareableSecret(shareableSecret: string): PlayerURL {
        this.searchParams.set(
            PlayerSearchParameters.shareableSecret,
            shareableSecret
        );
        return this;
    }

    getShareableSecret(): string | null {
        return this.searchParams.get(PlayerSearchParameters.shareableSecret);
    }
}

/**
 * Copies the current session URL with a search parameter "ts" with the player's current time in seconds.
 */
export const onGetLinkWithTimestamp = (time: number) => {
    return PlayerURL.currentURL().setTimestamp(time);
};
