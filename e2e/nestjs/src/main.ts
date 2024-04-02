import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HighlightInterceptor } from '@highlight-run/nest';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(
    new HighlightInterceptor({
      projectID: '2',
      serviceName: 'my-nestjs-app',
      serviceVersion: 'git-sha',
      environment: 'production',
      debug: false,
    }),
  );
  await app.listen(3000);
}
bootstrap();
