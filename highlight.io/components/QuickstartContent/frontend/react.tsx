import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'
import {
  configureSourcemapsCI,
  identifySnippet,
  initializeSnippet,
  setupBackendSnippet,
  verifySnippet,
} from './shared-snippets'

const ErrorBoundaryCodeSnippet = `import { ErrorBoundary } from '@highlight-run/react';

ReactDOM.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>,
    document.getElementById('root')
);`

export const ReactContent: QuickStartContent = {
  title: 'React.js',
  subtitle: 'Learn how to set up highlight.io with your React application.',
  logoUrl: siteUrl('/images/quickstart/react.svg'),
  entries: [
    {
      title: 'Install the npm package & SDK.',
      content: 'Install the npm package `highlight.run` in your terminal.',
      code: {
        text: `# with npm
npm install highlight.run @highlight-run/react

# with yarn
yarn add highlight.run @highlight-run/react`,
        language: 'bash',
      },
    },
    initializeSnippet,
    {
      title: 'Add the ErrorBoundary component. (optional)',
      content: `The ErrorBoundary component wraps your component tree and catches crashes/exceptions from your react app. When a crash happens, if \`showDialog\` is set, your users will be prompted with a modal to share details about what led up to the crash. Read more [here](https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/react-error-boundary).`,
      code: {
        text: ErrorBoundaryCodeSnippet,
        language: 'js',
      },
    },
    identifySnippet,
    verifySnippet,
    configureSourcemapsCI(),
    setupBackendSnippet,
  ],
}
