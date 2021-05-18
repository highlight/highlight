import { createContext } from '../../../../util/context/context';

interface HomePageFiltersContext {
    /** This is the look back period from today in days. */
    dateRangeLength: number;
    setDateRangeLength: React.Dispatch<React.SetStateAction<number>>;
}

export const [
    useHomePageFiltersContext,
    HomePageFiltersContext,
] = createContext<HomePageFiltersContext>('HomePageFiltersContext');
