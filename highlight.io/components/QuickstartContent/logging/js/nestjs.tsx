import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JSNestLogContent: QuickStartContent = {
  title: 'Nest.js',
  subtitle: 'Learn how to set up highlight.io log ingestion in Nest.js.',
  entries: [
    previousInstallSnippet('nestjs'),
    {
      title: 'Add the @highlight-run/nest app middleware.',
      content: 'Use the `HighlightLogger` middleware to record backend logs in highlight.io',
      code: {
        text: `import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HighlightLogger } from '@highlight-run/nest'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const highlightOpts = { projectID: 'YOUR_PROJECT_ID' }
  app.useLogger(new HighlightLogger(highlightOpts))
  await app.listen(3000)
}
bootstrap()
`,
        language: 'js',
      },
    },
    verifyLogs,
  ],
}
