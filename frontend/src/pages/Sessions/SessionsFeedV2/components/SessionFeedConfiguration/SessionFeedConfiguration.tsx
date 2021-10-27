import Button from '@components/Button/Button/Button';
import Popover from '@components/Popover/Popover';
import Select from '@components/Select/Select';
import SvgSettingsIcon from '@icons/SettingsIcon';
import {
    dateTimeFormats,
    SESSION_FEED_DATETIME_FORMAT,
    SessionFeedConfigurationContext,
} from '@pages/Sessions/SessionsFeedV2/context/SessionFeedConfigurationContext';
import { H } from 'highlight.run';
import moment from 'moment';
import React from 'react';

import styles from './SessionFeedConfiguration.module.scss';

interface Props {
    configuration: SessionFeedConfigurationContext;
}

const SessionFeedConfiguration = ({
    configuration: { datetimeFormat, setDatetimeFormat },
}: Props) => {
    return (
        <Popover
            content={
                <div className={styles.popover}>
                    <label className={styles.label}>
                        Datetime Format
                        <Select
                            options={dateTimeFormats.map((format) => ({
                                displayValue: `${formatDatetime(
                                    new Date().toString(),
                                    format
                                )}`,
                                value: format,
                                id: format,
                            }))}
                            value={datetimeFormat}
                            onChange={setDatetimeFormat}
                        />
                    </label>
                </div>
            }
            placement="right"
            trigger={['click']}
        >
            <Button
                trackingId="SessionFeedConfiguration"
                size="small"
                type="ghost"
            >
                <SvgSettingsIcon />
            </Button>
        </Popover>
    );
};

export default SessionFeedConfiguration;

export const formatDatetime = (
    datetime: string,
    format: SESSION_FEED_DATETIME_FORMAT
) => {
    switch (format) {
        case 'Relative':
            return moment(datetime).fromNow();
        case 'Date Only':
            return moment(datetime).format('M/D/YY');
        case 'Date and Time':
            return moment(datetime).format('M/D/YY h:mm A');
        case 'Date and Time with Milliseconds':
            return moment(datetime).format('M/D/YY h:mm:s A');
        case 'Unix':
            return moment(datetime).format('X');
        case 'Unix With Milliseconds':
            return moment(datetime).format('x');
        case 'ISO':
            return moment(datetime).toISOString();
        default:
            const error = new Error(
                `Unsupported date format used in formateDatetime: ${format}`
            );
            H.consumeError(error);
            return datetime;
    }
};
