import { Complete } from '../../util/types';
import { ErrorSearchParams } from './ErrorSearchContext/ErrorSearchContext';

export const EmptyErrorsSearchParams: Complete<ErrorSearchParams> = {
    browser: undefined,
    date_range: undefined,
    event: undefined,
    hide_resolved: false,
    os: undefined,
    visited_url: undefined,
};
