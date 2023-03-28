import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const RubyRailsLogContent: QuickStartContent = {
  title: 'Rails',
  subtitle: 'Learn how to set up highlight.io Rails log ingestion.',
  entries: [
    previousInstallSnippet('ruby'),
    {
      title: 'Set up the Highlight Logger.',
      content: 'In a Rails initializer, you can replace or extend your logger with the Highlight Logger.',
      code: {
        text: `require "highlight"

Highlight::H.new("<YOUR_PROJECT_ID>")

# you can replace the Rails.logger with Highlight's
Rails.logger = Highlight::Logger.new(STDOUT)

# or alternatively extend it to log with both
highlightLogger = Highlight::Logger.new(nil)
Rails.logger.extend(ActiveSupport::Logger.broadcast(highlightLogger))`,
        language: 'ruby',
      },
    },
    verifyLogs,
  ],
}
