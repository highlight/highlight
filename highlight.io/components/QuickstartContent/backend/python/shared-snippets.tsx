import { siteUrl } from '../../../../utils/urls'
import { fullstackMappingLink } from '../../frontend/shared-snippets'
import { QuickStartStep } from '../../QuickstartContent'

export const setupFrontendSnippet: QuickStartStep = {
  title: 'Setup your frontend Highlight snippet with tracingOrigins.',
  content: `Make sure that you followed the [fullstack mapping guide](${fullstackMappingLink}#How-can-I-start-using-this).`,
  code: {
    text: `H.init("<YOUR_PROJECT_ID>", {
  tracingOrigins: ['localhost', 'example.myapp.com/backend'],
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
  },
});`,
    language: 'js',
  },
}

export const downloadSnippet = (variant?: string): QuickStartStep => {
  return {
    title: 'Install the highlight-io python package.',
    content:
      'Download the package from pypi and save it to your requirements. ' +
      'If you use a zip or s3 file upload to publish your function, you will want to make sure ' +
      '`highlight-io` is part of the build.',
    code: {
      text: `poetry add highlight-io${variant ? '[' + variant + ']' : ''}
# or with pip
pip install highlight-io${variant ? '[' + variant + ']' : ''}`,
      language: 'bash',
    },
  }
}

export const setupLogging: (slug: string) => QuickStartStep = (slug) => ({
  title: 'Set up logging.',
  content: `With the Python SDK, your logs are reported automatically from builtin logging methods. See the Python [logging setup guide](${siteUrl(
    '/docs/getting-started/backend-logging/python/overview',
  )}) for more details.`,
})
