import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HighlightLogger, HighlightInterceptor } from '@highlight-run/nest'
import { NodeOptions } from '@highlight-run/node'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const highlightOpts: NodeOptions = {
		projectID: '1jdkoe52',
		otlpEndpoint: 'http://localhost:4318',
		serviceName: 'my-nest-app',
		serviceVersion: '1.0.0',
		environment: 'e2e-test',
	}
	app.useLogger(new HighlightLogger(highlightOpts))
	app.useGlobalInterceptors(new HighlightInterceptor(highlightOpts))
	app.enableShutdownHooks()

	await app.listen(3002)
}
bootstrap()
