import { Session } from '@graph/schemas';

import { sessionIsBackfilled } from './utils';

describe('sessionIsBackfilled', () => {
    it('returns false if there is no session', () => {
        expect(sessionIsBackfilled(undefined)).toBe(false);
    });

    it('returns false if there is no identifier', () => {
        const session = { identified: false } as Session;
        expect(sessionIsBackfilled(session)).toBe(false);
    });

    it('returns false if the session does not have an "identified" key', () => {
        const session = { identifier: 'jay@highlight.io' } as Session;
        expect(sessionIsBackfilled(session)).toBe(false);
    });

    it('returns true if there is an identifier and is not identified', () => {
        const session = {
            identifier: 'jay@highlight.io',
            identified: false,
        } as Session;
        expect(sessionIsBackfilled(session)).toBe(true);
    });
});
