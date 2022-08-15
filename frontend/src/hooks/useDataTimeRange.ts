import { useReactiveVar } from '@apollo/client';
import { dataTimeRange } from '@util/graph';
import moment from 'moment';

const roundDate = (d: moment.Moment, toMinutes: number) => {
    if (toMinutes <= 1) {
        return moment(d.format('YYYY-MM-DDTHH:mm:00.000000000Z'));
    }
    const remainder = toMinutes - (d.minute() % toMinutes);
    return d.add(remainder, 'minutes');
};

const useDataTimeRange = () => {
    const timeRange = useReactiveVar(dataTimeRange);
    const setTimeRange = (start: string, end: string, absolute = false) => {
        const startDate = moment(start);
        const endDate = moment(end);
        const minutesDiff = moment
            .duration(endDate.diff(startDate))
            .asMinutes();

        const roundedEnd = roundDate(endDate, Math.min(1, minutesDiff));
        const roundedStart = roundDate(startDate, Math.min(1, minutesDiff));

        dataTimeRange({
            start_date: moment(roundedStart).format(
                'YYYY-MM-DDTHH:mm:00.000000000Z'
            ),
            end_date: roundedEnd.format('YYYY-MM-DDTHH:mm:59.999999999Z'),
            absolute,
        });
    };

    return { timeRange, setTimeRange };
};

export default useDataTimeRange;
