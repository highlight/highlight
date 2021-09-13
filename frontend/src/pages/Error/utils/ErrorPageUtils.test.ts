import { GetErrorGroupQuery } from '@graph/operations';

import { GetErrorGroupQueryMock } from './__mocks__/GetErrorGroupQuery';
import { getErrorGroupMetadata } from './ErrorPageUtils';

describe('ErrorPageUtils', () => {
    describe('getErrorGroupMetadata', () => {
        it('should handle an undefined error group', () => {
            const result = getErrorGroupMetadata({
                error_group: {
                    field_group: undefined,
                },
            } as GetErrorGroupQuery);

            expect(result).toStrictEqual([]);
        });

        it('should handle an error group with duplicate fields', () => {
            const result = getErrorGroupMetadata(
                GetErrorGroupQueryMock as GetErrorGroupQuery
            );

            expect(result).toStrictEqual([
                { name: 'browser', value: 'Safari' },
                { name: 'os_name', value: 'Mac OS X' },
                { name: 'os_name', value: 'iPhone OS' },
                { name: 'browser', value: 'Chrome' },
                { name: 'os_name', value: 'OS' },
                { name: 'browser', value: 'Firefox' },
            ]);
        });
    });
});
