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

const DATE_FORMAT = 'DD MMM h:mm A';

const TimeRangePicker: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [datepickerOpen, setDatepickerOpen] = useState(false);
    const { timeRange, setTimeRange } = useDataTimeRange();

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

    useEffect(() => {
        if (!open) {
            setDatepickerOpen(false);
        }
    }, [open]);

    const label =
        DATE_OPTIONS[timeRange.lookback] ||
        `${moment(timeRange.start_date).format(DATE_FORMAT)} - ${moment(
            timeRange.end_date
        ).format(DATE_FORMAT)}`;

    return (
        <div
            className={classNames(styles.container, { [styles.open]: open })}
            ref={containerRef}
        >
            <div className={styles.input} onClick={() => setOpen(!open)}>
                {label}
            </div>

            {open && (
                <div className={classNames(styles.dateOptionsContainer)}>
                    {datepickerOpen && (
                        <div className={styles.datepickerContainer}>
                            <h3>Set Custom Time Range</h3>
                            <RangePicker
                                getPopupContainer={() =>
                                    containerRef?.current || document.body
                                }
                                className={styles.datepicker}
                                showTime
                                showNow
                                format={DATE_FORMAT}
                                value={[
                                    moment(timeRange.start_date),
                                    moment(timeRange.end_date),
                                ]}
                                onChange={(values) => {
                                    if (!values) {
                                        const endDate = moment().format();

                                        setTimeRange(
                                            moment(endDate)
                                                .subtract(15, 'minutes')
                                                .format(),
                                            endDate
                                        );
                                    } else {
                                        setTimeRange(
                                            moment(values?.[0]).format(),
                                            moment(values?.[1]).format(),
                                            true
                                        );
                                    }
                                }}
                            />

                            <hr />

                            <p>TODO: Add info about supported text searches.</p>
                        </div>
                    )}

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

                        <div
                            className={styles.dateOption}
                            onClick={() => setDatepickerOpen(!datepickerOpen)}
                        >
                            Custom
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeRangePicker;
