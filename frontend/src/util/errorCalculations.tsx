import moment from 'moment';

import { ErrorGroup, Maybe } from '../graph/generated/schemas';

/* Calculate metadata_log frequency over past n days */
export function frequencyTimeData(
    errorGroup: Maybe<ErrorGroup> | undefined,
    n: number
): Array<number> {
    if (!errorGroup) return [];
    const today = moment();
    const errorDatesCopy = Array(n).fill(0);
    for (const error of errorGroup?.metadata_log ?? []) {
        const errorDate = moment(error?.timestamp);
        const insertIndex =
            errorDatesCopy.length - 1 - today.diff(errorDate, 'days');
        if (insertIndex >= 0 || insertIndex < errorDatesCopy.length) {
            errorDatesCopy[insertIndex] += 1;
        }
    }
    return errorDatesCopy;
}
