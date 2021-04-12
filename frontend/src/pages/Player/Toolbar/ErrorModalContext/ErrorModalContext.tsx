import { ErrorObject } from '../../../../graph/generated/schemas';
import { createContext } from '../../../../util/context/context';

interface ErrorModalContext {
    selectedError: ErrorObject | undefined;
    setSelectedError: (val: ErrorObject | undefined) => void;
}

export const [
    useErrorModalContext,
    ErrorModalContextProvider,
] = createContext<ErrorModalContext>();
