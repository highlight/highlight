import Tooltip from '@components/Tooltip/Tooltip';
import React from 'react';

import styles from './BarChart.module.scss';

interface Props {
    data: Array<number>;
    xAxis?: string;
    yAxis?: string;
    loading?: boolean;
}

const BarChart = ({ data, xAxis = 'day', yAxis = 'occurence' }: Props) => {
    return (
        <>
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
                                height: `${
                                    (60 * num) / Math.max(...data, 5)
                                }px`,
                            }}
                        />
                        <div className={styles.barBase}></div>
                    </div>
                </Tooltip>
            ))}
        </>
    );
};

export default BarChart;
