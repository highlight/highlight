import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly httpService: HttpService) {}

  async findAll(throwError: boolean = false): Promise<string[]> {
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

    this.logger.log('hello, world!');
    this.logger.warn('whoa there! ', Math.random());
    if (throwError) {
      // error will be caught by the HighlightErrorFilter
      throw new Error(`a random error occurred!`);
    }
    return [`Hello World!`];
  }
}
