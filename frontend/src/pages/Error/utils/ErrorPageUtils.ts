import { GetErrorGroupQuery } from '../../../graph/generated/operations';
import { ErrorField } from '../../../graph/generated/schemas';

type ErrorFieldMetadata = Pick<ErrorField, 'name' | 'value'>[];

export const getErrorGroupMetadata = (
    errorGroup: GetErrorGroupQuery | undefined
): ErrorFieldMetadata => {
    if (!errorGroup?.error_group?.field_group) {
        return [];
    }

    const uniqueFields = new Set<string>();
    const delimiter = '!---!';

    errorGroup.error_group.field_group
        .filter((field) => field?.name !== 'visited_url')
        .forEach((field) => {
            if (field?.name && field.value) {
                uniqueFields.add(`${field.name}${delimiter}${field.value}`);
            }
        });

    const uniqueFieldsAsList = [...uniqueFields];
    return uniqueFieldsAsList.map((fieldCombination) => {
        const [name, value] = fieldCombination.split(delimiter);

        return {
            name,
            value,
        };
    });
};
