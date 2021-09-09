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
