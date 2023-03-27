import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const GoLogrusContent: QuickStartContent = {
  title: 'Go Logrus',
  subtitle: 'Learn how to set up highlight.io Go logrus log ingestion.',
  entries: [
    previousInstallSnippet('go'),
    {
      title: 'Add the Highlight logrus hook.',
      content: '`hlog.NewHook` is the highlight [Logrus](https://github.com/sirupsen/logrus) hook.',
      code: {
        text: `import (
  hlog "github.com/highlight/highlight/sdk/highlight-go/log"
  "github.com/sirupsen/logrus"
)

func main() {
  // ...
  // setup the highlight logrus hook for all desired log levels
  logrus.AddHook(hlog.NewHook(hlog.WithLevels(
      logrus.PanicLevel,
      logrus.FatalLevel,
      logrus.ErrorLevel,
      logrus.WarnLevel,
      logrus.InfoLevel,
  )))
  // ...
}`,
        language: 'go',
      },
    },
    verifyLogs,
  ],
}
