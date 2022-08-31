import {
    SESSION_FEED_COUNT_FORMAT,
    SESSION_FEED_DATETIME_FORMAT,
    SESSION_FEED_SORT_ORDER,
} from '@pages/Sessions/SessionsFeedV2/context/SessionFeedConfigurationContext';
import useLocalStorage from '@rehooks/local-storage';

const LOCAL_STORAGE_KEY_PREFIX = 'highlightSessionFeedConfiguration';

export const useSessionFeedConfiguration = () => {
    const [datetimeFormat, setDatetimeFormat] =
        useLocalStorage<SESSION_FEED_DATETIME_FORMAT>(
            `${LOCAL_STORAGE_KEY_PREFIX}DatetimeFormat`,
            'Date and Time'
        );
    const [countFormat, setCountFormat] =
        useLocalStorage<SESSION_FEED_COUNT_FORMAT>(
            `${LOCAL_STORAGE_KEY_PREFIX}CountFormat`,
            'Short'
        );
    const [sortOrder, setSortOrder] = useLocalStorage<SESSION_FEED_SORT_ORDER>(
        `${LOCAL_STORAGE_KEY_PREFIX}SortOrder`,
        'Descending'
    );

    return {
        datetimeFormat,
        setDatetimeFormat,
        countFormat,
        setCountFormat,
        sortOrder,
        setSortOrder,
    };
};
