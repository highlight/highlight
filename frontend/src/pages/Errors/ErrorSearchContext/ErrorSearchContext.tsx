import React from 'react';

export type ErrorSearchParams = {
    date_range?: { start_date: Date; end_date: Date };
    os?: string;
    browser?: string;
    visited_url?: string;
    hide_resolved?: boolean;
    event?: string;
};

export const ErrorSearchContext = React.createContext<{
    searchParams: ErrorSearchParams;
    setSearchParams: React.Dispatch<React.SetStateAction<ErrorSearchParams>>;
    existingParams: ErrorSearchParams;
    setExistingParams: React.Dispatch<React.SetStateAction<ErrorSearchParams>>;
    segmentName: string | null;
    setSegmentName: React.Dispatch<React.SetStateAction<string | null>>;
}>({
    /* eslint-disable */
    searchParams: {},
    setSearchParams: (params) => console.warn('noopy'),
    existingParams: {},
    setExistingParams: (params) => console.warn('goopy'),
    segmentName: null,
    setSegmentName: (val) => console.warn('poopy'),
    /* eslint-enable */
});
