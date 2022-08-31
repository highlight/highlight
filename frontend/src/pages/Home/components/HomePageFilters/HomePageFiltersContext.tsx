import { createContext } from '../../../../util/context/context';

interface HomePageFiltersContext {
    /** This is the look back period from today in days. */
    dateRangeLength: number;
    setDateRangeLength: React.Dispatch<React.SetStateAction<number>>;
    /** Whether this project has data recorded already. If the project hasn't recorded any sessions then this will be false. */
    hasData: boolean;
    setHasData: React.Dispatch<React.SetStateAction<boolean>>;
}

export const [useHomePageFiltersContext, HomePageFiltersContext] =
    createContext<HomePageFiltersContext>('HomePageFiltersContext');
