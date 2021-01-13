import React from 'react';

export type UserProperty = {
    name: string;
    value: string;
}

export type SearchParams = {
    user_properties: Array<UserProperty>;
    excluded_properties?: Array<UserProperty>;
    date_range?: { start_date: Date; end_date: Date };
    os?: string;
    browser?: string;
    visited_url?: string;
    referrer?: string;
    identified: boolean;
}

export const SearchContext = React.createContext<{
    searchParams: SearchParams;
    setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
    isSegment: boolean;
    setIsSegment: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    searchParams: { user_properties: [], identified: false },
    setSearchParams: params => console.warn('noop'),
    isSegment: false,
    setIsSegment: val => console.warn('poop'),
});
