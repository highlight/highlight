import useDataTimeRange, { DataTimeRange } from '@hooks/useDataTimeRange';
import { DatePicker } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

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

const UNITS = [
    'm',
    'minute',
    'minutes',
    'h',
    'hour',
    'hours',
    'd',
    'day',
    'days',
    'w',
    'week',
    'weeks',
    'm',
    'month',
    'months',
];

const DATE_FORMAT = 'DD MMM h:mm A';

const TimeRangePicker: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [datepickerOpen, setDatepickerOpen] = useState(false);
    const [customDateRange, setCustomDateRange] = useState('');
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
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleKeyDown);
        } else {
            setDatepickerOpen(false);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    useHotkeys(
        't',
        (e) => {
            e.preventDefault();
            setOpen(!open);
        },
        []
    );

    const label = buildDateRangeLabel(timeRange);

    // TODO: Make options tabbable.`
    // TODO: Consider using dropdown component.
    return (
        <div
            className={classNames(styles.container, { [styles.open]: open })}
            ref={containerRef}
        >
            <div
                className={styles.labelContainer}
                onClick={() => setOpen(!open)}
            >
                <span className={styles.label}>{label}</span>
                <span className={styles.hotkeyHelp}>
                    <pre>t</pre>
                </span>
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
                                disabledDate={(current) =>
                                    current && current > moment().endOf('day')
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
                        </div>
                    )}

                    <div className={styles.dateOptions}>
                        <form
                            className={styles.dateOption}
                            tabIndex={0}
                            onSubmit={(e) => {
                                e.preventDefault();

                                const offset = customDateRange.replace(
                                    /\D/g,
                                    ''
                                );
                                const unit = customDateRange
                                    .replace(offset, '')
                                    .trim();

                                if (UNITS.indexOf(unit) === -1) {
                                    return;
                                }

                                const endDate = moment().format();

                                setTimeRange(
                                    moment(endDate)
                                        .subtract(offset, unit as any)
                                        .format(),
                                    endDate
                                );

                                setCustomDateRange('');
                                setOpen(false);
                            }}
                        >
                            <input
                                autoFocus
                                className={styles.input}
                                value={customDateRange}
                                onChange={(e) =>
                                    setCustomDateRange(e.target.value)
                                }
                                placeholder={`"1w", "7 days", or "37m"`}
                            />
                        </form>

                        {Object.keys(DATE_OPTIONS)
                            .map(Number) // convert string to number
                            .map((offset, index) => (
                                <button
                                    className={styles.dateOption}
                                    tabIndex={0}
                                    key={index}
                                    type="button"
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
                                </button>
                            ))}

                        <button
                            className={styles.dateOption}
                            tabIndex={0}
                            onClick={() => setDatepickerOpen(!datepickerOpen)}
                        >
                            Custom
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const HOUR = 60;
const DAY = 60 * 24;
const WEEK = 60 * 24 * 7;
const MONTH = 60 * 24 * 30;

const buildDateRangeLabel = (range: DataTimeRange) => {
    if (range.absolute) {
        return `${moment(range.start_date).format(DATE_FORMAT)} - ${moment(
            range.end_date
        ).format(DATE_FORMAT)}`;
    }

    if (range.lookback < HOUR) {
        return `${range.lookback} minutes`;
    } else if (range.lookback < DAY) {
        const diff = range.lookback / HOUR;
        return `${diff} ${diff > 1 ? 'hours' : 'hour'}`;
    } else if (range.lookback < WEEK) {
        const diff = range.lookback / DAY;
        return `${diff} ${diff > 1 ? 'days' : 'day'}`;
    } else if (range.lookback < MONTH) {
        const diff = range.lookback / WEEK;
        return `${diff} ${diff > 1 ? 'weeks' : 'week'}`;
    }
};

export default TimeRangePicker;
