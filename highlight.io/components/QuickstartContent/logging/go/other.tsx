import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'
import { logrusExample } from './shared-snippets'

export const GoOtherLogContent: QuickStartContent = {
	title: 'Go (Other)',
	subtitle: 'Learn how to set up highlight.io Go log ingestion with logrus.',
	logoUrl: siteUrl('/images/quickstart/go.svg'),
	entries: [
		previousInstallSnippet('go'),
		...logrusExample(
			'ctx',
			`package main

import (
  "context"
  "github.com/highlight/highlight/sdk/highlight-go"
  "github.com/highlight/highlight/sdk/highlight-go/log"
  "github.com/sirupsen/logrus"
)

func main() {
  // setup the highlight SDK
  highlight.SetProjectID("<YOUR_PROJECT_ID>")
  highlight.Start()
  defer highlight.Stop()

  // setup highlight logrus hook
  hlog.Init()
  // if you don't want to get stdout / stderr output, add the following uncommented
  // hlog.DisableOutput()

  // if in a request, provide context to associate logs with frontend sessions
  ctx := context.TODO()
  // send logs
  logrus.WithContext(ctx).WithField("hello", "world").Info("welcome to highlight.io")
  // send logs with a string message severity
  lvl, _ := logrus.ParseLevel("warn")
  logrus.WithContext(ctx).Log(lvl, "whoa there")
}`,
		),
		verifyLogs,
	],
}
