declare type HighlightPublicInterface = {
    init: (orgID: number, debug?: boolean) => void;
    identify: (identify: string, scriptPath: string) => void;
    onHighlightReady: (func: () => void) => void;
};
export declare const Highlight: HighlightPublicInterface;
export {};
