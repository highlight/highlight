import React from 'react';
import { createContext } from '../../../util/context';

export type UserProperty = {
    name: string;
    value: string;
};

export interface SearchParams {
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
}

export interface SessionSearchParams extends SearchParams {
    boba?: string;
}
export interface ErrorSearchParams extends SearchParams {
    lineNumber?: number;
}

interface ISearchContext<T> {
    searchParams: T;
    setSearchParams: React.Dispatch<React.SetStateAction<T>>;
    existingParams: T;
    setExistingParams: React.Dispatch<React.SetStateAction<T>>;
    segmentName: string | null;
    setSegmentName: React.Dispatch<React.SetStateAction<string | null>>;
}

export const [useSessionSearchContext, SessionSearchProvider] = createContext<
    ISearchContext<SessionSearchParams>
>();

export const [
    useErrorFeedSearchContext,
    ErrorFeedSearchProvider,
] = createContext<ISearchContext<ErrorSearchParams>>();
