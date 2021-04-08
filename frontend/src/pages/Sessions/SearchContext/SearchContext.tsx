import React from 'react';

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
};

export const SearchContext = React.createContext<{
    searchParams: SearchParams;
    setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
    existingParams: SearchParams;
    setExistingParams: React.Dispatch<React.SetStateAction<SearchParams>>;
    segmentName: string | null;
    setSegmentName: React.Dispatch<React.SetStateAction<string | null>>;
    hideLiveSessions: boolean;
    setHideLiveSessions: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    /* eslint-disable */
    searchParams: { user_properties: [], identified: false },
    setSearchParams: (params) => console.warn('noop'),
    existingParams: { user_properties: [], identified: false },
    setExistingParams: (params) => console.warn('goop'),
    segmentName: null,
    setSegmentName: (val) => console.warn('poop'),
    hideLiveSessions: false,
    setHideLiveSessions: () => {},
    /* eslint-enable */
});
