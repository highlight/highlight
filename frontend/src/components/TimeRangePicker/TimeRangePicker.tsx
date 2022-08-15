import useDataTimeRange from '@hooks/useDataTimeRange';
import { DatePicker } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';

const { RangePicker } = DatePicker;

import styles from './TimeRangePicker.module.scss';

export const DATE_OPTIONS: { [key: number]: string } = {
    5: 'Last 5 minutes',
    15: 'Last 15 minutes',
    60: 'Last 1 hours',
    360: 'Last 6 hours',
    1440: 'Last 24 hours',
    10080: 'Last 7 days',
    43200: 'Last 30 days',
};

const DATE_FORMAT = 'DD MMM h:mm a';

const TimeRangePicker: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [datepickerOpen, setDatepickerOpen] = useState(false);
    const { timeRange, setTimeRange } = useDataTimeRange();

    const difference = Math.floor(
        Math.abs(
            moment
                .duration(
                    moment(timeRange.start_date).diff(
                        moment(timeRange.end_date)
                    )
                )
                .asMinutes()
        )
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as HTMLElement)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [containerRef]);

    console.log('::: DIFFERENCE :::', difference);
    console.log('::: DATES :::', timeRange.start_date, timeRange.end_date);

    const label = DATE_OPTIONS[difference] || 'Custom';

    return (
        <div
            className={classNames(styles.container, { [styles.open]: open })}
            onClick={() => {
                if (!open) {
                    setOpen(true);
                }
            }}
            ref={containerRef}
        >
            <div className={styles.input}>{label}</div>

            {open && (
                <div className={classNames(styles.dateOptionsContainer)}>
                    <div className={styles.dateOptions}>
                        {Object.keys(DATE_OPTIONS)
                            .map(Number) // convert string to number
                            .map((offset, index) => (
                                <div
                                    className={styles.dateOption}
                                    key={index}
                                    onClick={() => {
                                        setOpen(false);

                                        const endDate = moment()
                                            .startOf('minute')
                                            .format();
                                        const startDate = moment(endDate)
                                            .subtract(offset, 'minutes')
                                            .format();

                                        setTimeRange(startDate, endDate);
                                    }}
                                >
                                    {DATE_OPTIONS[offset]}
                                </div>
                            ))}

                        <div className={styles.datepickerContainer}>
                            {/* <RangePicker
                                className={styles.datepicker}
                                showTime
                                showNow
                                open
                                getPopupContainer={() =>
                                    datepickerContainerRef?.current ||
                                    document.body
                                }
                                size="small"
                                bordered={false}
                                allowClear={false}
                                format={DATE_FORMAT}
                                value={[moment(startDate), moment(endDate)]}
                                onPanelChange={(value) => {
                                    console.log('::: PANEL CHANGE :::', value);
                                    // setEndDate(
                                    //     dateStrings[0]
                                    //         ? moment(dateStrings[0])
                                    //         : undefined
                                    // );
                                    // setStartDate(
                                    //     dateStrings[1]
                                    //         ? moment(dateStrings[1])
                                    //         : undefined
                                    // );
                                }}
                            /> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeRangePicker;
