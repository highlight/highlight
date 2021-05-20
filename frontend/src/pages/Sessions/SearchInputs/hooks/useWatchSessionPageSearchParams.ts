import { message } from 'antd';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { SessionPageSearchParams } from '../../../Player/utils/utils';
import {
    SearchParams,
    useSearchContext,
} from '../../SearchContext/SearchContext';

/**
 * Watches for search params that affect the search params on the session page.
 * @param searchParam The SearchParam to watch for.
 * @param setSearchParamsCallback A function that returns the next state for SearchParams.
 * @param getDisplayText A function that returns a string that is shown to the user when a search param match is found.
 */
const useWatchSessionPageSearchParams = (
    searchParam: SessionPageSearchParams,
    setSearchParamsCallback: (value: any) => SearchParams,
    getDisplayText: (value: any) => string
) => {
    const history = useHistory();
    const { setSearchParams } = useSearchContext();

    useEffect(() => {
        const valueFromSearchParams = new URLSearchParams(location.search).get(
            searchParam
        );

        if (valueFromSearchParams) {
            message.success(getDisplayText(valueFromSearchParams));
            setSearchParams(() =>
                setSearchParamsCallback(valueFromSearchParams)
            );
            history.replace({ search: '' });
        }
    }, [
        getDisplayText,
        history,
        searchParam,
        setSearchParams,
        setSearchParamsCallback,
    ]);
};

export default useWatchSessionPageSearchParams;
