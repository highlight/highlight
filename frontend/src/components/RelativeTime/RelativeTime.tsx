import moment from 'moment';
import React from 'react';
import Tooltip from '../Tooltip/Tooltip';

interface Props {
    datetime: string;
}

const RelativeTime = ({ datetime }: Props) => {
    const momentDatetime = moment(datetime);

    return (
        <Tooltip title={momentDatetime.format('MMMM Do YYYY, h:mm A')}>
            <span>{momentDatetime.fromNow()}</span>
        </Tooltip>
    );
};

export default RelativeTime;
