import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const RubyOtherLogContent: QuickStartContent = {
  title: 'Ruby',
  subtitle: 'Learn how to set up highlight.io Ruby log ingestion.',
  entries: [
    previousInstallSnippet('ruby'),
    {
      title: 'Set up and call the Highlight Logger.',
      content:
        'Highlight::Logger can be used in place of your existing logger, and will record and send logs to Highlight.',
      code: {
        text: `require "highlight"

Highlight::H.new("<YOUR_PROJECT_ID>")

logger = Highlight::Logger.new(STDOUT)
logger.info('hello, world!')
logger.error('oh no!')`,
        language: 'ruby',
      },
    },
    verifyLogs,
  ],
}
