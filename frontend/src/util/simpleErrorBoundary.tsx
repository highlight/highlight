import { H } from 'highlight.run';
import React from 'react';

type ErrorBoundaryProps = {
    children: React.ReactNode;
};

export class SimpleErrorBoundary extends React.Component<{
    children: React.ReactNode;
}> {
    state = { hasError: false };
    constructor(props: ErrorBoundaryProps) {
        super(props);
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        H.consumeError(error, 'Error in Highlight custom boundary!', {
            good: 'morning',
        });
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }
        return this.props.children;
    }
}
