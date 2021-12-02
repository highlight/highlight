import { createContext } from '../../../../util/context/context';

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

interface HomePageFiltersContext {
    dateRange: DateRange;
    setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
    /** Whether this project has data recorded already. If the project hasn't recorded any sessions then this will be false. */
    hasData: boolean;
    setHasData: React.Dispatch<React.SetStateAction<boolean>>;
}

export const [
    useHomePageFiltersContext,
    HomePageFiltersContext,
] = createContext<HomePageFiltersContext>('HomePageFiltersContext');
