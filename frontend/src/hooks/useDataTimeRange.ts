import { makeVar, useReactiveVar } from '@apollo/client';
import moment from 'moment';

const defaultEndDate = moment().format();
const defaultLookback = 15;

const dataTimeRange = makeVar<{
    start_date: string;
    end_date: string;
    lookback: number;
    absolute: boolean;
}>({
    start_date: moment(defaultEndDate)
        .subtract(defaultLookback, 'minutes')
        .format(),
    end_date: defaultEndDate,
    lookback: defaultLookback,
    absolute: false,
});

const useDataTimeRange = () => {
    const timeRange = useReactiveVar(dataTimeRange);
    const setTimeRange = (start: string, end: string, absolute = false) => {
        const endDate = moment(end);
        const startDate = moment(start);
        const lookback = moment.duration(endDate.diff(startDate)).asMinutes();

        dataTimeRange({
            start_date: startDate.format('YYYY-MM-DDTHH:mm:00.000000000Z'),
            end_date: endDate.format('YYYY-MM-DDTHH:mm:59.999999999Z'),
            lookback,
            absolute,
        });
    };

    return { timeRange, setTimeRange };
};

export default useDataTimeRange;
