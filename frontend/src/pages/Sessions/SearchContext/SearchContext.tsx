import React from 'react';

export type UserProperty = {
    name: string;
    value: string;
}

export type SearchParams = {
    user_properties: Array<UserProperty>;
}

export const SearchContext = React.createContext<{
    searchParams: SearchParams;
    setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
}>({
    searchParams: { user_properties: [] },
    setSearchParams: params => console.warn('noop'),
});
