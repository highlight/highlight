import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	jsGetSnippet,
	manualError,
	verifyError,
} from './shared-snippets-monitoring'

export const JSNestReorganizedContent: QuickStartContent = {
	title: 'Nest.js',
	subtitle: 'Learn how to set up highlight.io in Nest.js.',
	logoUrl: siteUrl('/images/quickstart/nestjs.svg'),
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['nest']),
		{
			title: 'Add the @highlight-run/nest app middleware.',
			content:
				'Use the `HighlightErrorFilter` middleware to capture backend errors.',
			code: [
				{
					text: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HighlightInterceptor, H } from '@highlight-run/nest';

const env = {
  projectID: '<YOUR_PROJECT_ID>',
  serviceName: 'my-nestjs-app',
  serviceVersion: 'git-sha',
  environment: 'production',
  debug: false,
};

async function bootstrap() {
  H.init(env);
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new HighlightInterceptor(env));
  await app.listen(3000);
}
bootstrap();
`,
					language: 'js',
				},
			],
		},
		manualError,
		verifyError(
			'Nest.js',
			`import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    console.log('hello, world!')
    console.warn('whoa there! ', Math.random())
    if (Math.random() < 0.2) {
      // error will be caught by the HighlightErrorFilter
      throw new Error(\`a random error occurred! ${Math.random()}\`)
    }
    return 'Hello World!'
  }
}
`,
		),
		verifyLogs,
		verifyTraces,
	],
}
