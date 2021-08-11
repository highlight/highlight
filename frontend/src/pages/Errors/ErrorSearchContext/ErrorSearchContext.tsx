import React from 'react';

import { createContext } from '../../../util/context/context';

export type ErrorSearchParams = {
    date_range?: { start_date: Date; end_date: Date };
    os?: string;
    browser?: string;
    visited_url?: string;
    hide_resolved?: boolean;
    event?: string;
};

export type ErrorSearchContext = {
    searchParams: ErrorSearchParams;
    setSearchParams: React.Dispatch<React.SetStateAction<ErrorSearchParams>>;
    existingParams: ErrorSearchParams;
    setExistingParams: React.Dispatch<React.SetStateAction<ErrorSearchParams>>;
    segmentName: string | null;
    setSegmentName: React.Dispatch<React.SetStateAction<string | null>>;
};

export const [
    useErrorSearchContext,
    ErrorSearchContextProvider,
] = createContext<ErrorSearchContext>('ErrorSearchContext');
