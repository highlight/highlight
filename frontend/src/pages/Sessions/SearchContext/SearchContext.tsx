import React from 'react';

export type UserProperty = {
    name: string;
    value: string;
}

export type SearchParams = {
    userProperties: Array<UserProperty>;
}

export const SearchContext = React.createContext<{
    searchParams: SearchParams;
    setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
}>({
    searchParams: { userProperties: [] },
    setSearchParams: params => console.warn('noop'),
});
