import React from 'react';

import { createContext } from '../../../util/context/context';

export type UserProperty = {
    id: string;
    name: string;
    value: string;
};

export type SearchParams = {
    user_properties: Array<UserProperty>;
    excluded_properties?: Array<UserProperty>;
    track_properties?: Array<UserProperty>;
    excluded_track_properties?: Array<UserProperty>;
    environments?: string[];
    app_versions?: string[];
    date_range?: { start_date: Date; end_date: Date };
    length_range?: { min: number; max: number };
    os?: string;
    browser?: string;
    visited_url?: string;
    referrer?: string;
    identified: boolean;
    hide_viewed?: boolean;
    device_id?: string;
    /** Whether this session is the user's first session. */
    first_time?: boolean;
    /** Whether to show sessions that have not been processed yet. */
    show_live_sessions?: boolean;
};

interface SearchContext {
    /** Local changes to the segment parameters that might not be persisted to the database. */
    searchParams: SearchParams;
    setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
    /** The parameters that are persisted to the database. These params are saved to a segment. */
    existingParams: SearchParams;
    setExistingParams: React.Dispatch<React.SetStateAction<SearchParams>>;
    segmentName: string | null;
    setSegmentName: React.Dispatch<React.SetStateAction<string | null>>;
    showStarredSessions: boolean;
    setShowStarredSessions: React.Dispatch<React.SetStateAction<boolean>>;
    selectedSegment: { value: string; id: string } | undefined;
    setSelectedSegment: (
        newValue:
            | {
                  value: string;
                  id: string;
              }
            | undefined
    ) => void;
}

export const [
    useSearchContext,
    SearchContextProvider,
] = createContext<SearchContext>('SearchContext');
