import React from 'react';
import { H } from 'highlight.run';

type ErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

export class HighlightBoundary extends React.Component<{}, ErrorBoundaryState> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        this.setState({ error: error });
        H.consumeError(error, 'Error in Highlight custom boundary!', {
            good: 'morning',
        });
    }

    render() {
        if (this.state.hasError) {
            return <h1>Well this is awkward...</h1>;
        }
        return this.props.children;
    }
}
