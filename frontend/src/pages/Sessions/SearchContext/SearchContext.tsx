import React from 'react';
import { createContext } from '../../../util/context/context';

export type UserProperty = {
    name: string;
    value: string;
};

export type SearchParams = {
    user_properties: Array<UserProperty>;
    excluded_properties?: Array<UserProperty>;
    track_properties?: Array<UserProperty>;
    date_range?: { start_date: Date; end_date: Date };
    length_range?: { min: number; max: number };
    os?: string;
    browser?: string;
    visited_url?: string;
    referrer?: string;
    identified: boolean;
    hide_viewed?: boolean;
    /** Whether this session is the user's first session. */
    first_time?: boolean;
};

interface SearchContext {
    searchParams: SearchParams;
    setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
    existingParams: SearchParams;
    setExistingParams: React.Dispatch<React.SetStateAction<SearchParams>>;
    segmentName: string | null;
    setSegmentName: React.Dispatch<React.SetStateAction<string | null>>;
    hideLiveSessions: boolean;
    setHideLiveSessions: React.Dispatch<React.SetStateAction<boolean>>;
}

export const [
    useSearchContext,
    SearchContextProvider,
] = createContext<SearchContext>();
