import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HighlightInterceptor, H } from '@highlight-run/nest';

const env = {
  projectID: '2',
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
