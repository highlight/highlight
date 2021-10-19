import { H } from 'highlight.run';
import validator from 'validator';

import { Maybe, Session } from '../../../../../../graph/generated/schemas';

export const getIdentifiedUserProfileImage = (
    session: Maybe<Session>
): string | undefined => {
    if (!session || !session.user_properties) {
        return undefined;
    }

    try {
        const avatarField = JSON.parse(session.user_properties).find(
            (field: any) => field?.name === 'avatar'
        );

        if (avatarField) {
            const { value } = avatarField;

            if (validator.isURL(value)) {
                return '' + value;
            }
        }
    } catch {
        return undefined;
    }
    return undefined;
};

// Fallback logic for the display name shown for the session card
export const getDisplayName = (session: Maybe<Session>) => {
    let userProperties;
    try {
        if (typeof session?.user_properties === 'string') {
            userProperties = JSON.parse(session?.user_properties || '{}');
        }
    } catch (e) {
        if (e instanceof Error) {
            H.consumeError(e);
        }
    }

    return (
        userProperties?.highlightDisplayName ||
        userProperties?.email ||
        session?.identifier ||
        (session?.fingerprint && `#${session?.fingerprint}`) ||
        'unidentified'
    );
};
