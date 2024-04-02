import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly httpService: HttpService) {}

  async findAll(): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<any[]>(
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
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw `An error happened while hitting pub.highlight.io! ${error.response?.data}`;
          }),
        ),
    );

    console.log('hello, world!');
    console.warn('whoa there! ', Math.random());
    if (Math.random() < 0.2) {
      // error will be caught by the HighlightErrorFilter
      throw new Error(`a random error occurred! 0.32986848886277653`);
    }
    return [`Hello World! ${data}`];
  }
}
