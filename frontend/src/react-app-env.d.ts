/// <reference types="react-scripts" />
interface Window {
    analytics: any;
    H: any;
    CommandBar: CommandBar;
}

interface CommandBar {
    addContext: (context: any) => void;
    removeContext: (context: any) => void;
    boot: (boot: any) => void;
    addRouter: (func: (url: any) => void) => void;
    addSearch: (key: string, func: (val: string) => Promise<Array<any>>) => void;
}
