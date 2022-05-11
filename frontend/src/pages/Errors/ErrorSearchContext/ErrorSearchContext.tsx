import { ErrorState } from '@graph/schemas';
import { createContext } from '@util/context/context';
import React from 'react';

export type ErrorSearchParams = {
    date_range?: { start_date: Date; end_date: Date };
    os?: string;
    browser?: string;
    visited_url?: string;
    state?: ErrorState;
    event?: string;
    type?: string;
    query?: string;
};

type ErrorSearchContext = {
    searchParams: ErrorSearchParams;
    setSearchParams: React.Dispatch<React.SetStateAction<ErrorSearchParams>>;
    existingParams: ErrorSearchParams;
    setExistingParams: React.Dispatch<React.SetStateAction<ErrorSearchParams>>;
    segmentName: string | null;
    setSegmentName: React.Dispatch<React.SetStateAction<string | null>>;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    page?: number;
    setPage: React.Dispatch<React.SetStateAction<number | undefined>>;
};

export const [
    useErrorSearchContext,
    ErrorSearchContextProvider,
] = createContext<ErrorSearchContext>('ErrorSearchContext');
