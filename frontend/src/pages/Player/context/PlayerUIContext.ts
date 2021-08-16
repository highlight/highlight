import AsyncSelect from 'react-select/async';

import { createContext } from '../../../util/context/context';
import { SessionSearchOption } from '../../Sessions/SessionsFeedV2/components/SessionSearch/SessionSearch';

interface PlayerUIContext {
    searchBarRef: AsyncSelect<SessionSearchOption, true> | undefined;
    setSearchBarRef: React.Dispatch<
        React.SetStateAction<AsyncSelect<SessionSearchOption, true> | undefined>
    >;
}

export const [
    usePlayerUIContext,
    PlayerUIContextProvider,
] = createContext<PlayerUIContext>('PlayerUI');
