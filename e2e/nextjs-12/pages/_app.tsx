import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ErrorBoundary } from '@highlight-run/react';
import { H } from 'highlight.run';

H.init('1', {
  tracingOrigins: true,
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
  },
  scriptUrl: 'http://localhost:8080/dist/index.js',
  backendUrl: 'https://localhost:8082/public',
});

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <ErrorBoundary showDialog>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
};

export default App;
