import React from 'react';

import { ErrorState } from '../../../graph/generated/schemas';
import { createContext } from '../../../util/context/context';

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
    isQueryBuilder: boolean;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    startErrorGroupID?: string;
    setStartErrorGroupID: React.Dispatch<
        React.SetStateAction<string | undefined>
    >;
};

export const [
    useErrorSearchContext,
    ErrorSearchContextProvider,
] = createContext<ErrorSearchContext>('ErrorSearchContext');
