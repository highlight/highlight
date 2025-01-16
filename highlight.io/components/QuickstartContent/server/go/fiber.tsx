import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { logrusExample } from './shared-snippets-logging'
import { verifyLogs } from '../shared-snippets-logging'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	verifyGoErrors,
} from './shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'

export const GoFiberReorganizedContent: QuickStartContent = {
	title: 'Go Fiber',
	subtitle:
		'Learn how to set up highlight.io monitoring and logging on your Go Fiber backend.',
	logoUrl: siteUrl('/images/quickstart/fiber.svg'),
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Add the Highlight Fiber error handler.',
			content:
				'`highlightFiber.Middleware()` provides a [Go Fiber](https://github.com/gofiber/fiber) middleware to automatically record and send errors to Highlight.',
			code: [
				{
					text: `import (
  highlightFiber "github.com/highlight/highlight/sdk/highlight-go/middleware/fiber"
)

func main() {
  // ...
  app := fiber.New()
  app.Use(highlightFiber.Middleware())
  // ...
}`,
					language: 'go',
				},
			],
		},
		customGoError,
		verifyGoErrors,
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
		verifyTraces,
	],
}
