import { message } from 'antd';
import { useEffect, useState } from 'react';
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
    getDisplayText: (value: any) => string,
    setSearchParamsCallbackAsync?: (value: any) => Promise<SearchParams>
) => {
    const history = useHistory();
    const { setSearchParams } = useSearchContext();
    const [handled, setHandled] = useState(false);
    message.config({
        maxCount: 1,
    });

    useEffect(() => {
        const worker = async () => {
            const valueFromSearchParams = new URLSearchParams(
                location.search
            ).get(searchParam);

            if (valueFromSearchParams && !handled) {
                message.success(getDisplayText(valueFromSearchParams));

                if (setSearchParamsCallbackAsync) {
                    const searchParams = await setSearchParamsCallbackAsync(
                        valueFromSearchParams
                    );
                    setSearchParams(searchParams);
                } else {
                    setSearchParams(() =>
                        setSearchParamsCallback(valueFromSearchParams)
                    );
                }
                setHandled(true);
            }
        };

        worker();
    }, [
        getDisplayText,
        handled,
        history,
        searchParam,
        setSearchParams,
        setSearchParamsCallback,
        setSearchParamsCallbackAsync,
    ]);
};

export default useWatchSessionPageSearchParams;
