import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { H } from '@highlight-run/nest';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly httpService: HttpService) {}

  async findAll({
    error,
    empty,
  }: {
    error?: true;
    empty?: true;
  }): Promise<string[]> {
    const span = await H.startActiveSpan('making request now', {});
    await firstValueFrom(
      this.httpService.post<any[]>(
        'https://pub.highlight.io/v1/logs/json',
        {
          message: 'yo!',
          timestamp: new Date().toISOString(),
          level: 'warning',
        },
        {
          headers: {
            'x-highlight-project': '2',
            'x-highlight-service': 'nestjs-axios-request',
          },
        },
      ),
    );
    span.end();

    for (let i = 0; i < 10; i++) {
      const s = await H.startActiveSpan(`another request ${i}`, {
        attributes: { i },
      });
      console.log('hello, world!');
      this.logger.log('hello, world!');
      this.logger.warn('whoa there! ', Math.random());
      s.end();
    }
    if (error) {
      // error will be caught by the HighlightErrorFilter
      throw new Error(`a random error occurred!`);
    }
    if (!empty) {
      return [`Hello World!`];
    }
  }
}
