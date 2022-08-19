import { BaseSearchContext } from '@context/BaseSearchContext';
import { ErrorState } from '@graph/schemas';
import { createContext } from '@util/context/context';

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

type ErrorSearchContext = BaseSearchContext<ErrorSearchParams> & {};

export const [
    useErrorSearchContext,
    ErrorSearchContextProvider,
] = createContext<ErrorSearchContext>('ErrorSearchContext');
