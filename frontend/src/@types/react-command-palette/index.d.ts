declare module 'react-command-palette' {
    import * as React from 'react';

    interface ReactCommandPaletteProps {
        trigger: React.ReactNode;
        hotKeys: string[];
        open?: boolean;
        highlightFirstSuggestion?: boolean;
        closeOnSelect?: boolean;
        onSelect?: any;
        onChange?: any;
        onHighlight?: any;
        commands: Array<{ name: string; command: () => void; id: string }>;
    }

    class ReactCommandPalette extends React.Component<ReactCommandPaletteProps> {
        static defaultProps?: ReactCommandPaletteProps;
    }

    export default ReactCommandPalette;
}
