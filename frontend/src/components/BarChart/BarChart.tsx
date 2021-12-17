import Tooltip from '@components/Tooltip/Tooltip';
import React, { useEffect, useState } from 'react';

import styles from './BarChart.module.scss';

interface Props {
    data: Array<number>;
    xAxis?: string;
    yAxis?: string;
    height?: number;
    width?: number;
    sharedMaxNum?: number;
}

const BarChart = ({
    data,
    xAxis = 'day',
    yAxis = 'occurence',
    height = 60,
    width = 100,
    sharedMaxNum,
}: Props) => {
    const [maxNum, setMaxNum] = useState(5);

    useEffect(() => {
        if (!!sharedMaxNum) {
            setMaxNum(sharedMaxNum);
        } else {
            setMaxNum(Math.max(...data, 5));
        }
    }, [sharedMaxNum, data]);

    return (
        <div
            style={{ height: height, width: width }}
            className={styles.barChartWrapper}
        >
            {data.map((num, ind) => (
                <Tooltip
                    title={`${
                        data.length - 1 - ind
                    } ${xAxis}(s) ago\n ${num} ${yAxis}(s)`}
                    key={ind}
                >
                    <div className={styles.barDiv}>
                        <div
                            className={styles.bar}
                            style={{
                                height: `${(height - 4) * (num / maxNum)}px`,
                            }}
                        />
                        <div className={styles.barBase}></div>
                    </div>
                </Tooltip>
            ))}
        </div>
    );
};

export default BarChart;
