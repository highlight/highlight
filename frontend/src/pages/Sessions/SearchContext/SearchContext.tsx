import React from 'react';

export type UserProperty = {
    name: string;
    value: string;
}

// Add an 'excluded_identifier_substrings' to this type.
export type SearchParams = {
    user_properties: Array<UserProperty>;
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
}>({
    searchParams: { user_properties: [], identified: false },
    setSearchParams: params => console.warn('noop'),
});
