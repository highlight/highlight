import { act, renderHook } from '@testing-library/react-hooks/dom';

import useDataTimeRange from './useDataTimeRange';

describe('useDataTimeRange', () => {
    it('rounds times correctly', () => {
        const { result } = renderHook(() => useDataTimeRange());

        act(() => {
            result.current.setTimeRange(
                '2022-08-23 09:00:15',
                '2022-08-23 09:15:45'
            );
        });

        expect(result.current.timeRange.start_date).toEqual(
            '2022-08-23T09:00:00.000000000-05:00'
        );
        expect(result.current.timeRange.end_date).toEqual(
            '2022-08-23T09:15:00.000000000-05:00'
        );

        act(() => {
            result.current.setTimeRange(
                '2022-08-23 09:00:45',
                '2022-08-23 09:15:15'
            );
        });

        expect(result.current.timeRange.start_date).toEqual(
            '2022-08-23T09:00:00.000000000-05:00'
        );
        expect(result.current.timeRange.end_date).toEqual(
            '2022-08-23T09:15:00.000000000-05:00'
        );
    });

    it('calculates the lookback time correctly', () => {
        const { result } = renderHook(() => useDataTimeRange());

        act(() => {
            result.current.setTimeRange(
                '2022-08-23 09:00:15',
                '2022-08-23 09:15:45'
            );
        });

        expect(result.current.timeRange.lookback).toEqual(15);

        act(() => {
            result.current.setTimeRange(
                '2022-08-23 09:00:45',
                '2022-08-23 09:15:15'
            );
        });

        expect(result.current.timeRange.lookback).toEqual(15);
    });
});
