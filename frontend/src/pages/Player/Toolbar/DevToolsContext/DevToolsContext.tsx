import { createContext } from '../../../../util/context/context';

interface DevToolsContext {
    openDevTools: boolean;
    setOpenDevTools: (val: boolean) => void;
    /** If set, this content will show up in the blade that's on top of the DevTools.   */
    panelContent?: { title: string; content: React.ReactNode };
    setPanelContent: React.Dispatch<
        React.SetStateAction<
            | {
                  title: string;
                  content: React.ReactNode;
              }
            | undefined
        >
    >;
}

export const [
    useDevToolsContext,
    DevToolsContextProvider,
] = createContext<DevToolsContext>('DevTools');
