import { H } from 'highlight.run';
import React from 'react';

import styles from './ErrorBoundary.module.scss';

type ErrorBoundaryProps = {
    children: React.ReactNode;
};

export class SimpleErrorBoundary extends React.Component<{
    children: React.ReactNode;
}> {
    state = { hasError: false, error: null };
    constructor(props: ErrorBoundaryProps) {
        super(props);
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
            return (
                <main className={styles.container}>
                    <h1>Well this is awkward...</h1>
                    <p>
                        Highlight just crashed. The engineers have been notified
                        about this. Feel free to send us a message on Slack or
                        Intercom.
                    </p>
                    <code>
                        {(this.state.error as Error | null)?.toString()}
                    </code>
                </main>
            );
        }
        return this.props.children;
    }
}
