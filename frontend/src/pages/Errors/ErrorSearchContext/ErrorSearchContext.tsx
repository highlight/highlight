import React from 'react';

export type UserProperty = {
    name: string;
    value: string;
};

export type ErrorSearchParams = {
    date_range?: { start_date: Date; end_date: Date };
    os?: string;
    browser?: string;
    visited_url?: string;
    hide_viewed?: boolean;
};

export const ErrorSearchContext = React.createContext<{
    errorSearchParams: ErrorSearchParams;
    setErrorSearchParams: React.Dispatch<
        React.SetStateAction<ErrorSearchParams>
    >;
    existingParams: ErrorSearchParams;
    setExistingParams: React.Dispatch<React.SetStateAction<ErrorSearchParams>>;
    segmentName: string | null;
    setSegmentName: React.Dispatch<React.SetStateAction<string | null>>;
}>({
    errorSearchParams: {},
    setErrorSearchParams: () => console.warn('noop'),
    existingParams: {},
    setExistingParams: () => console.warn('goop'),
    segmentName: null,
    setSegmentName: () => console.warn('poop'),
});
