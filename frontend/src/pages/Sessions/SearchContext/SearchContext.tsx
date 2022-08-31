import { BaseSearchContext } from '@context/BaseSearchContext';
import { QueryBuilderState } from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder';
import { createContext } from '@util/context/context';
import React from 'react';

export type UserProperty = {
    id: string;
    name: string;
    value: string;
};

export type SearchParams = {
    user_properties: Array<UserProperty>;
    excluded_properties?: Array<UserProperty>;
    track_properties?: Array<UserProperty>;
    excluded_track_properties?: Array<UserProperty>;
    environments?: string[];
    app_versions?: string[];
    date_range?: { start_date: Date; end_date: Date };
    length_range?: { min: number; max: number };
    os?: string;
    browser?: string;
    visited_url?: string;
    referrer?: string;
    identified: boolean;
    hide_viewed?: boolean;
    device_id?: string;
    city?: string;
    /** Whether this session is the user's first session. */
    first_time?: boolean;
    /** Whether to show sessions that have not been processed yet. */
    show_live_sessions?: boolean;
    query?: string;
};

type QueryBuilderType = 'sessions' | 'errors';
export type QueryBuilderInput =
    | (QueryBuilderState & { type: QueryBuilderType })
    | undefined;

type SearchContext = BaseSearchContext<SearchParams> & {
    showStarredSessions: boolean;
    setShowStarredSessions: React.Dispatch<React.SetStateAction<boolean>>;
    selectedSegment: { value: string; id: string } | undefined;
    setSelectedSegment: (
        newValue:
            | {
                  value: string;
                  id: string;
              }
            | undefined
    ) => void;
    queryBuilderInput: QueryBuilderInput;
    setQueryBuilderInput: React.Dispatch<
        React.SetStateAction<QueryBuilderInput>
    >;
    isQuickSearchOpen: boolean;
    setIsQuickSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const showLiveSessions = (searchParams: SearchParams): boolean => {
    // If query is defined, check if it allows live sessions
    if (!!searchParams.query) {
        const query = JSON.parse(searchParams.query) as QueryBuilderState;
        // If any 'custom_processed' has 'false', assume we're showing live sessions
        const processedRules = query.rules.filter(
            (r) => r[0] === 'custom_processed'
        );
        return (
            processedRules.length === 0 ||
            processedRules.flatMap((i) => i).includes('false')
        );
    }

    // Else, default to the show_live_sessions search param
    return searchParams?.show_live_sessions ?? false;
};

export const [useSearchContext, SearchContextProvider] =
    createContext<SearchContext>('SearchContext');
