import { SESSION_FEED_DATETIME_FORMAT } from '@pages/Sessions/SessionsFeedV2/context/SessionFeedConfigurationContext';
import useLocalStorage from '@rehooks/local-storage';

const LOCAL_STORAGE_KEY_PREFIX = 'highlightSessionFeedConfiguration';

export const useSessionFeedConfiguration = () => {
    const [
        datetimeFormat,
        setDatetimeFormat,
    ] = useLocalStorage<SESSION_FEED_DATETIME_FORMAT>(
        `${LOCAL_STORAGE_KEY_PREFIX}DatetimeFormat`,
        'Date and Time'
    );

    return {
        datetimeFormat,
        setDatetimeFormat,
    };
};
