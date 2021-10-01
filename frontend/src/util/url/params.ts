import { UserProperty } from '@pages/Sessions/SearchContext/SearchContext';
import { decodeDelimitedArray, encodeDelimitedArray } from 'use-query-params';

/**
 * Delimiter used to delimit a properties value and id.
 */
const FIELD_DELIMITER = '||';

/**
 * Delimiter used to delimit individual properties.
 */
const PROPERTY_DELIMITER = ',';

export const FieldArrayParam = {
    encode(properties?: UserProperty[]) {
        if (!properties) {
            return undefined;
        }
        const mappedPropertiesAsString = properties!.map(
            ({ id, name, value }) => {
                const [valueKey] = value.split(':');

                // @ts-expect-error
                if (id === -1 && name === 'contains') {
                    return `${value}`;
                }
                return `${id}${FIELD_DELIMITER}${name}${FIELD_DELIMITER}${valueKey}`;
            }
        );
        const encodedProperties = encodeDelimitedArray(
            mappedPropertiesAsString,
            PROPERTY_DELIMITER
        );
        return `${encodedProperties}`;
    },

    decode(strValue: any) {
        const decodedProperties = decodeDelimitedArray(
            strValue,
            PROPERTY_DELIMITER
        );
        const mappedProperties = decodedProperties?.map((property) => {
            if (property?.includes(FIELD_DELIMITER)) {
                const [id, name, valueKey] = property.split(FIELD_DELIMITER);

                return {
                    id,
                    name,
                    value: `${valueKey}:${name}`,
                };
            } else {
                return {
                    id: -1,
                    name: 'contains',
                    value: property,
                };
            }
        });
        return mappedProperties;
    },
};
