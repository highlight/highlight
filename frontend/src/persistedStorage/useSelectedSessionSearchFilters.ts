import useLocalStorage from '@rehooks/local-storage';

import { SessionSearchFilterOptions } from '../pages/Sessions/SessionsFeed/components/SessionSearch/components/SessionSearchFilters/SessionSearchFilters';

/**
 * Getter/setter for the selected session search filters.
 */
const useSelectedSessionSearchFilters = () => {
    const [
        selectedSearchFilters,
        setSelectedSearchFilters,
    ] = useLocalStorage('highlightSessionSearchFilters', [
        ...SessionSearchFilterOptions,
    ]);

    return { selectedSearchFilters, setSelectedSearchFilters };
};

export default useSelectedSessionSearchFilters;
