import AsyncSelect from 'react-select/async';

import { createContext } from '../../../util/context/context';
import { ErrorSearchOption } from '../components/ErrorSearch/ErrorSearch';

interface ErrorPageUIContext {
    searchBarRef: AsyncSelect<ErrorSearchOption, true> | undefined;
    setSearchBarRef: React.Dispatch<
        React.SetStateAction<AsyncSelect<ErrorSearchOption, true> | undefined>
    >;
}

export const [
    useErrorPageUIContext,
    ErrorPageUIContextProvider,
] = createContext<ErrorPageUIContext>('ErrorPageUI');
