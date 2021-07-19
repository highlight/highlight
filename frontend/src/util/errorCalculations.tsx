import moment from 'moment';

import { ErrorMetadata, Maybe } from '../graph/generated/schemas';

/* Calculate metadata_log frequency over past n days */
export function frequencyTimeData(
    metadataLog: Maybe<Array<Maybe<ErrorMetadata>>> | undefined,
    n: number
): Array<number> {
    if (!metadataLog) return [];
    const today = moment();
    const errorDatesCopy = Array(n).fill(0);
    for (const error of metadataLog ?? []) {
        const errorDate = moment(error?.timestamp);
        const insertIndex =
            errorDatesCopy.length - 1 - today.diff(errorDate, 'days');
        if (insertIndex >= 0 || insertIndex < errorDatesCopy.length) {
            errorDatesCopy[insertIndex] += 1;
        }
    }
    return errorDatesCopy;
}
