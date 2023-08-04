import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'
import { logrusExample } from './shared-snippets'

export const GoFiberLogContent: QuickStartContent = {
	title: 'Logging from a Go Fiber App',
	subtitle: 'Learn how to set up highlight.io Go log ingestion with fiber.',
	logoUrl: siteUrl('/images/quickstart/go.svg'),
	entries: [
		previousInstallSnippet('go'),
		...logrusExample(
			'c.Context()',
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
  highlight.Start(
    highlight.WithServiceName("my-fiber-app"),
    highlight.WithServiceVersion("git-sha"),
  )
  defer highlight.Stop()

  // setup highlight logrus hook
  hlog.Init()
  // if you don't want to get stdout / stderr output, add the following uncommented
  // hlog.DisableOutput()

  app := fiber.New()
  app.Use(logger.New())
  // setup go fiber to use the highlight middleware for header parsing
  app.Use(highlightFiber.Middleware())

  app.Get("/", func(c *fiber.Ctx) error {
  	// in handlers, use logrus with the UserContext to associate logs with the frontend session.
	logrus.WithContext(c.Context()).Infof("hello from highlight.io")
	return c.SendString("Hello, World!")
  })

  logrus.Fatal(app.Listen(":3456"))
}`,
		),
		verifyLogs,
	],
}
