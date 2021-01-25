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
    totalCount: Number;
    setTotalCount: React.Dispatch<React.SetStateAction<number>>;
    isSegment: boolean;
    setIsSegment: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    searchParams: { user_properties: [], identified: false },
    setSearchParams: (params) => console.warn('noop'),
    existingParams: { user_properties: [], identified: false },
    setExistingParams: (params) => console.warn('goop'),
    isSegment: false,
    setIsSegment: (val) => console.warn('poop'),
    totalCount: -1,
    setTotalCount: (val) => console.warn('doop'),
});
