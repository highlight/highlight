import { H } from 'highlight.run';
import validator from 'validator';

import { Maybe, Session } from '../../../../../../graph/generated/schemas';

export const getIdentifiedUserProfileImage = (
    session: Maybe<Session>
): string | undefined => {
    if (!session || !session.field_group) {
        return undefined;
    }

    try {
        const parsedFieldGroup = JSON.parse(session.field_group);
        const avatarField = parsedFieldGroup.find(
            (field: any) => field['Name'] === 'avatar'
        );

        if (avatarField) {
            const { Value } = avatarField;

            if (validator.isURL(Value)) {
                return Value;
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
        userProperties = JSON.parse(session?.user_properties || '{}');
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
