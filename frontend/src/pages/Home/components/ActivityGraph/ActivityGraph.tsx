import 'react-calendar-heatmap/dist/styles.css';

import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { useParams } from 'react-router-dom';

import { useHomePageFiltersContext } from '../HomePageFilters/HomePageFiltersContext';

const ActivityGraph = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const { dateRangeLength, setHasData } = useHomePageFiltersContext();

    return (
        <div>
            <CalendarHeatmap
                startDate={new Date('2016-01-01')}
                endDate={new Date('2016-04-01')}
                values={[
                    { date: '2016-01-02', count: 12 },
                    { date: '2016-01-22', count: 122 },
                    { date: '2016-01-24', count: 500 },
                    { date: '2016-01-30', count: 38 },
                    // ...and so on
                ]}
                classForValue={(value) => `${value?.count}-foo`}
            />
            <CalendarHeatmap
                startDate={new Date('2021-05-23')}
                endDate={new Date('2021-05-28')}
                values={[
                    {
                        date: '2021-05-23',
                        count: 53842,
                    },
                    {
                        date: '2021-05-24',
                        count: 1000,
                    },
                    {
                        date: '2021-05-25',
                        count: 5499771,
                    },
                    {
                        date: '2021-05-26',
                        count: 4505066,
                    },
                    {
                        date: '2021-05-27',
                        count: 2964693,
                    },
                ]}
            />
        </div>
    );
};

export default ActivityGraph;
